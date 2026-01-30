# Hitch v2.0 - Regulatory Compliance Update

> **Version:** 2.0 - Regulatory Compliance Framework
> **Legal Framework:** Albanian Civil Code Art. 877-900, Law 10128/2009, Law 124/2024 (GDPR-aligned)

---

## Executive Summary

Hitch operates as a **cost-sharing coordination platform** that connects private individuals traveling the same route. This update implements comprehensive compliance features that:

1. **Enforce cost-sharing pricing** - Ensures contributions never exceed actual trip costs
2. **Generate civil agreements** - Provides transparent documentation of expense sharing
3. **Implement data minimization** - Follows GDPR/Law 124/2024 best practices
4. **Decouple revenue from transport** - SaaS monetization as an Information Society Service

### Legal Basis

Under Albanian law and EU precedent (ECJ BlaBlaCar ruling C-390/18), cost-sharing arrangements where:
- Drivers do not profit from providing rides
- Contributions only cover shared expenses (fuel, tolls, wear)
- The platform facilitates coordination without providing transport

...constitute **private arrangements** rather than commercial transport services. This means:
- No transport operator license required
- No E-Fatura (electronic invoicing) obligation
- Platform operates as Information Society Service (Law 10128/2009)

---

## Phase 1: PriceAuthority Engine (Cost Ceiling Module)

### 1.1 Objective
Implement automatic price calculation that caps contributions at verified trip costs, ensuring the non-commercial nature of all rides.

### 1.2 Database Schema Changes

```prisma
// Add to prisma/schema.prisma

model FuelPrice {
  id        String   @id @default(cuid())
  pricePerLiter Int    // In LEK
  fuelType  FuelType @default(DIESEL)
  source    String   // "manual" or "scrape_url"
  validFrom DateTime @default(now())
  createdAt DateTime @default(now())

  @@index([validFrom])
}

model ComplianceConfig {
  id                    String @id @default(cuid())
  avgConsumptionL100km  Float  @default(8.5)    // Liters per 100km
  wearAndTearLekKm      Int    @default(12)     // LEK per km
  legalReimbursementCap Int    @default(35)     // MAX LEK per km
  tollKalimash          Int    @default(660)    // Kalimash tunnel fee
  updatedAt             DateTime @updatedAt
}

enum FuelType {
  DIESEL
  PETROL
  LPG
}

// Modify Ride model - ADD these fields
model Ride {
  // ... existing fields ...

  // Compliance fields
  calculatedMaxFare   Int?      // System-calculated ceiling
  actualContribution  Int?      // What rider actually paid (must be <= max)
  distanceKm          Float?    // Route distance for transparency
  complianceStatus    ComplianceStatus @default(COMPLIANT)

  // Driver cost-share tracking
  driverSharePaid     Boolean   @default(false) // Driver pays their portion too
}

enum ComplianceStatus {
  COMPLIANT        // Price <= calculated max
  MANUAL_OVERRIDE  // Admin override (logged)
  AUDIT_FLAGGED    // Pattern requiring review
}
```

### 1.3 New Service: `src/services/price-authority.service.ts`

```typescript
/**
 * PRICE AUTHORITY MODULE
 * -----------------------------------------------------------------------
 * Implements cost-ceiling calculations per Albanian Civil Code (Art. 877–900)
 * ensuring contributions reflect actual shared expenses.
 *
 * COMPLIANCE RATIONALE:
 * When Contribution <= Cost, the arrangement is expense reimbursement,
 * not commercial transport. This aligns with EU BlaBlaCar precedent
 * and Albanian civil law on private contracts.
 */

export interface TripCostParams {
  distanceKm: number;
  hasTolls: boolean;
  passengers: number; // Excludes driver
  fuelPriceLek?: number; // Override for testing
}

export interface FareCalculation {
  maxFareTotal: number;       // Total trip cost
  maxFarePerPassenger: number; // What each passenger contributes
  driverShare: number;        // Driver's own contribution
  breakdown: {
    fuelCost: number;
    amortization: number;
    tolls: number;
  };
  legalCapApplied: boolean;   // True if capped by regulatory maximum
  legalStatus: 'COST_SHARING_REIMBURSEMENT';
}

export async function calculateLegalFare(params: TripCostParams): Promise<FareCalculation>;
export async function getCurrentFuelPrice(): Promise<number>;
export async function getComplianceConfig(): Promise<ComplianceConfig>;
export function validateFareCompliance(requestedPrice: number, calculated: FareCalculation): boolean;
```

### 1.4 Algorithm Implementation

```
MaxContribution = (Distance × FuelPrice × Consumption) + (Distance × Amortization) + Tolls

Where:
- Distance: km (from route calculation)
- FuelPrice: ~190 LEK/L (updated weekly from market data)
- Consumption: 0.085 L/km (8.5L/100km - conservative average)
- Amortization: 12 LEK/km (tire/oil/depreciation standard rate)
- Tolls: 660 LEK (Kalimash) or 0

CRITICAL: Driver pays their share too (demonstrates non-commercial nature)
PerPersonCost = MaxContribution / (Passengers + 1)

CEILING: If PerKmRate > 35 LEK/km → Cap at 35 LEK/km
```

### 1.5 UI Changes

| Current | New |
|---------|-----|
| "Price per seat" input field | **Calculated field** - System determines based on route |
| Driver sets arbitrary price | Driver sees "Estimated Contribution: XXX LEK" |
| "Fare" / "Price" labels | "Contribution" / "Share" terminology |
| "Book" button | "Request Seat" button |

### 1.6 Files to Create/Modify

- [ ] `src/services/price-authority.service.ts` - Core calculation engine
- [ ] `src/lib/constants/compliance.ts` - Configuration constants
- [ ] `src/app/api/compliance/fuel-price/route.ts` - Fuel price management
- [ ] `src/app/api/rides/calculate-fare/route.ts` - Contribution calculation endpoint
- [ ] Modify `src/components/forms/RideForm.tsx` - Display calculated contribution
- [ ] Modify `src/app/api/rides/route.ts` - Enforce contribution ceiling
- [ ] Add `prisma/migrations/xxx_compliance_fields.sql`

### 1.7 Tests Required

```typescript
// tests/unit/services/price-authority.test.ts
describe('PriceAuthority', () => {
  it('calculates Tirana-Durres (36km) at ~450 LEK total', async () => {});
  it('calculates Tirana-Vlora (150km) at ~4000 LEK total', async () => {});
  it('splits cost evenly including driver', async () => {});
  it('applies 35 LEK/km ceiling when calculated rate exceeds it', async () => {});
  it('includes Kalimash toll when route requires it', async () => {});
  it('rejects any contribution above calculated maximum', async () => {});
  it('returns legalStatus: COST_SHARING_REIMBURSEMENT always', async () => {});
});
```

---

## Phase 2: Civil Agreement Generator (Documentation Module)

### 2.1 Objective
Generate clear "Cost-Sharing Agreements" that document the expense-sharing nature of each trip, providing transparency for all parties.

### 2.2 Agreement Document Structure

```typescript
interface CivilAgreement {
  id: string;
  type: 'MARREVESHJE_NDARJA_SHPENZIMEVE'; // "Expense Sharing Agreement"

  route: {
    origin: string;
    destination: string;
    distanceKm: number;
  };

  costBreakdown: {
    estimatedFuelConsumed: string; // e.g., "3.1 Liters"
    fuelCost: number;
    wearAndTear: number;
    tolls: number;
    totalTripCost: number;
  };

  parties: {
    driverContribution: number;
    passengerContribution: number;
    totalParticipants: number;
  };

  legalBasis: {
    statute: 'Civil Code Art. 877';
    declaration: string; // Expense sharing statement
  };

  generatedAt: Date;
  expiresAt: Date; // 24 hours from generation (data minimization)

  // Distinguished from commercial invoices: NO invoice number, NO VAT, NO fiscal QR
}
```

### 2.3 Bilingual Declaration

**Albanian:**
```
VËRTETIM I NDARJES SË SHPENZIMEVE TË UDHËTIMIT

Palët bien dakord që ky kontribut është rreptësisht një ndarje e
shpenzimeve sipas Nenit 877 të Kodit Civil. Kjo nuk përbën
aktivitet tregtar dhe nuk gjeneron fitim për asnjë palë.
```

**English:**
```
CERTIFICATE OF TRAVEL EXPENSE SHARING

The parties agree that this contribution is strictly a sharing
of expenses pursuant to Article 877 of the Civil Code. This does
not constitute commercial activity and generates no profit for any party.
```

### 2.4 Files to Create

- [ ] `src/services/agreement-generator.service.ts`
- [ ] `src/components/agreements/CivilAgreementCard.tsx`
- [ ] `src/app/[locale]/agreements/[id]/page.tsx` - View agreement (24hr access)
- [ ] `src/messages/en.json` - Add legal text translations
- [ ] `src/messages/sq.json` - Add Albanian legal text

---

## Phase 3: Data Minimization Protocol (GDPR Compliance)

### 3.1 Objective
Implement GDPR-aligned data retention policies per Law 124/2024 (Albanian Data Protection Law), retaining personal data only as long as necessary for service delivery.

### 3.2 Retention Policy

```sql
-- Automated cleanup runs hourly

-- Completed ride details: 24 hours post-completion
DELETE FROM "Ride"
WHERE status = 'COMPLETED'
AND "updatedAt" < NOW() - INTERVAL '24 HOURS';

-- Finalized bookings: 24 hours
DELETE FROM "Booking"
WHERE status IN ('ACCEPTED', 'DECLINED', 'CANCELLED')
AND "updatedAt" < NOW() - INTERVAL '24 HOURS';

-- Search analytics: 7 days (aggregated, anonymized after)
DELETE FROM "SearchLog"
WHERE "createdAt" < NOW() - INTERVAL '7 DAYS';

-- Agreements: Per expiry timestamp
DELETE FROM "CivilAgreement"
WHERE "expiresAt" < NOW();
```

### 3.3 Implementation Options

**Option A: Database-level (Recommended for MVP)**
- Vercel Cron or pg_cron extension
- Simple, reliable, no application code changes

**Option B: Application-level**
- Next.js API route triggered by cron
- More control, easier to test

### 3.4 User Communication

Add to UI when ride completes:
```
✓ Ride completed successfully

📋 Your trip agreement is available for 24 hours
   After that, ride data is automatically removed
   in accordance with data protection requirements.

[View Agreement] [Download PDF]
```

### 3.5 Files to Create/Modify

- [ ] `src/lib/cron/data-cleanup.ts` - Cleanup logic
- [ ] `vercel.json` - Add cron configuration
- [ ] `src/app/api/cron/cleanup/route.ts` - Cron endpoint
- [ ] Modify Prisma schema - Add `expiresAt` to relevant models
- [ ] Add data retention policy to Terms of Service

### 3.6 Privacy Policy Section

```markdown
## Data Retention

We retain personal trip data only as long as necessary to provide
our service, in compliance with Law 124/2024 (Data Protection) and
EU GDPR principles:

- **Active rides:** Until 24 hours after completion
- **Search history:** 7 days (anonymized for analytics thereafter)
- **Agreements:** 24 hours after generation

Users may request data export during the retention window via Settings.
```

---

## Phase 4: SaaS Monetization Module

### 4.1 Objective
Generate revenue through software services **independent of transport transactions**, establishing the platform as an Information Society Service provider.

### 4.2 Revenue Streams

| Stream | Price | Service Classification |
|--------|-------|------------------------|
| Verification Badge | 500 LEK one-time | Digital Identity Service |
| Pro Subscription | €4.99/month | Software License Fee |
| Boost Tokens | 10 for €2 | Digital Placement Service |

### 4.3 Database Schema

```prisma
model Subscription {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])

  tier      SubscriptionTier @default(FREE)
  status    SubscriptionStatus @default(ACTIVE)

  // Payment processor fields
  stripeCustomerId     String?
  stripeSubscriptionId String?

  currentPeriodStart DateTime?
  currentPeriodEnd   DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model VerificationBadge {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])

  type      VerificationType
  verifiedAt DateTime @default(now())
  expiresAt  DateTime?

  // Privacy: Store verification result only, not source documents
  verificationProvider String?
  verificationRef      String?
}

model BoostToken {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])

  quantity  Int      @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum SubscriptionTier {
  FREE        // 1 ride/day
  PRO         // Unlimited + features
}

enum SubscriptionStatus {
  ACTIVE
  CANCELLED
  PAST_DUE
}

enum VerificationType {
  PHONE       // SMS verification
  ID_BASIC    // Age verification only
  ID_FULL     // Full identity verification
  DRIVER      // Driver's license verified
}
```

### 4.4 Feature Gating

```typescript
// src/lib/feature-gates.ts

export const FEATURE_LIMITS = {
  FREE: {
    ridesPerDay: 1,
    canSeeWhoViewed: false,
    advanceSchedulingDays: 1,
    canBoostRides: false,
  },
  PRO: {
    ridesPerDay: Infinity,
    canSeeWhoViewed: true,
    advanceSchedulingDays: 30,
    canBoostRides: true,
  },
};

export async function checkFeatureAccess(
  userId: string,
  feature: keyof typeof FEATURE_LIMITS.FREE
): Promise<boolean>;

export async function getRemainingRidesToday(userId: string): Promise<number>;
```

### 4.5 Terms of Service Excerpt

```markdown
## 4. Platform Fees

### 4.1 Nature of Fees
Fees charged by Hitch are for the license to use the Software platform
and for optional Identity Verification services. The Platform does not
charge, collect, or determine contributions for physical transport. All
transport arrangements are private agreements between users.

### 4.2 Platform Role
Hitch operates as an Information Society Service Provider under Law
No. 10128/2009 "On Electronic Commerce." We provide software tools
that help users coordinate shared travel. We are not a carrier, taxi
service, or transport operator.

### 4.3 Subscription Services
Pro subscriptions provide enhanced software features including unlimited
ride visibility, extended scheduling, and priority placement. These fees
are for software access, not transport services.
```

### 4.6 Files to Create

- [ ] `src/services/subscription.service.ts`
- [ ] `src/services/verification.service.ts`
- [ ] `src/lib/feature-gates.ts`
- [ ] `src/app/api/subscriptions/route.ts`
- [ ] `src/app/api/verification/route.ts`
- [ ] `src/app/[locale]/settings/subscription/page.tsx`
- [ ] `src/components/subscription/UpgradePrompt.tsx`
- [ ] `src/components/verification/VerificationBadge.tsx`

---

## Phase 5: Legal Documentation Module

### 5.1 Legal Citations Reference

```typescript
// src/lib/legal/citations.ts

export const LEGAL_CITATIONS = {
  costSharing: {
    statute: 'Civil Code of Albania, Articles 877-900',
    summary: 'Defines contracts for transport; validates non-commercial private arrangements',
    url: 'https://qbz.gov.al/eli/ligj/1994/07/29/7850',
  },
  taxScope: {
    statute: 'Law No. 87/2019 "On Fiscalization"',
    article: 'Article 4 (Scope)',
    summary: 'Applies to taxpayers issuing invoices for economic activity',
    interpretation: 'Expense reimbursements are not taxable income; no fiscalization required for cost-sharing',
  },
  dataProtection: {
    statute: 'Law No. 124/2024 "On Personal Data Protection"',
    article: 'Article 5 (Data Minimization)',
    summary: 'Personal data kept no longer than necessary for specified purpose',
    url: 'https://qbz.gov.al/eli/ligj/2024/09/15/124',
  },
  informationService: {
    statute: 'Law No. 10128/2009 "On Electronic Commerce"',
    summary: 'Defines Information Society Services and provider obligations',
    interpretation: 'Platform provides software coordination, not transport services',
  },
  transportRegulation: {
    statute: 'Law No. 8308/1998 "On Road Transport"',
    summary: 'Distinguishes licensed commercial transport from private arrangements',
    interpretation: 'Cost-sharing between private parties is not regulated commercial transport',
  },
  euPrecedent: {
    case: 'ECJ Case C-390/18 (AIRBNB Ireland)',
    related: 'BlaBlaCar rulings in France and Spain',
    summary: 'Cost-sharing platforms are information services, not transport providers, when they do not set prices or control drivers',
  },
};
```

### 5.2 Legal Pages Content

Create `src/app/[locale]/legal/page.tsx` with:

1. **How Cost-Sharing Works** - Plain language explanation
2. **Legal Framework** - Full statute references with links
3. **Your Rights** - GDPR/data protection summary
4. **Platform vs. Transport** - Why Hitch is a software service

### 5.3 Files to Create

- [ ] `src/lib/legal/citations.ts`
- [ ] `src/app/[locale]/legal/page.tsx`
- [ ] `src/app/[locale]/legal/privacy/page.tsx`
- [ ] `src/app/[locale]/legal/terms/page.tsx`
- [ ] `src/messages/en.json` - Legal translations
- [ ] `src/messages/sq.json` - Albanian legal text

---

## Phase 6: Infrastructure & PWA

### 6.1 Hosting Configuration

| Component | Provider | Region | Rationale |
|-----------|----------|--------|-----------|
| Frontend/API | Vercel | EU Edge | Performance, Next.js optimization |
| Database | Neon/Supabase | EU (Frankfurt) | GDPR compliance |
| Domain | .com | N/A | International accessibility |
| Payments | Stripe | EU | PSD2 compliance |

### 6.2 PWA Configuration

Enable Progressive Web App for native-like experience:

```json
// public/manifest.json
{
  "name": "Hitch - Ridesharing Albania",
  "short_name": "Hitch",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
```

### 6.3 Files to Create/Modify

- [ ] `public/manifest.json`
- [ ] `src/app/layout.tsx` - Add manifest link
- [ ] `next.config.ts` - PWA headers
- [ ] `vercel.json` - Edge function config

---

## Implementation Milestones

### Milestone 8: PriceAuthority Engine
**Priority:** P0 (Foundation for compliance)

- [ ] Create `ComplianceConfig` and `FuelPrice` models
- [ ] Implement `price-authority.service.ts`
- [ ] Write comprehensive tests for contribution calculation
- [ ] Modify RideForm to display calculated-only pricing
- [ ] Update ride creation API to enforce ceiling
- [ ] Add fuel price management endpoint
- [ ] **GIT COMMIT:** "feat: implement cost-sharing price calculation engine"

### Milestone 9: Civil Agreement Generator
**Priority:** P0

- [ ] Design agreement document schema
- [ ] Implement `agreement-generator.service.ts`
- [ ] Create bilingual agreement templates
- [ ] Add agreement view page (24hr access)
- [ ] Generate agreement on ride completion
- [ ] **GIT COMMIT:** "feat: civil agreement generator for expense documentation"

### Milestone 10: Data Minimization Protocol
**Priority:** P1

- [ ] Implement data cleanup cron job
- [ ] Add `expiresAt` fields to models
- [ ] Configure Vercel cron
- [ ] Test data deletion workflow
- [ ] Update privacy policy
- [ ] **GIT COMMIT:** "feat: GDPR-compliant data retention policy"

### Milestone 11: Subscription Infrastructure
**Priority:** P2 (Can launch without)

- [ ] Create subscription models
- [ ] Implement feature gating
- [ ] Build subscription management UI
- [ ] Integrate Stripe (or stub for later)
- [ ] Add verification badge system
- [ ] **GIT COMMIT:** "feat: SaaS subscription infrastructure"

### Milestone 12: Legal Documentation
**Priority:** P1

- [ ] Create legal citations module
- [ ] Build legal/about pages
- [ ] Write Terms of Service
- [ ] Write Privacy Policy
- [ ] Add Albanian translations
- [ ] **GIT COMMIT:** "docs: legal framework documentation"

### Milestone 13: Infrastructure & PWA
**Priority:** P2

- [ ] Configure PWA manifest
- [ ] Configure hosting
- [ ] Set up domain
- [ ] Security headers
- [ ] **GIT COMMIT:** "chore: infrastructure and PWA setup"

---

## Execution Checklist

- [x] Milestone 0-7: Original MVP (v1.0.0)
- [ ] Milestone 8: PriceAuthority Engine
- [ ] Milestone 9: Civil Agreement Generator
- [ ] Milestone 10: Data Minimization Protocol
- [ ] Milestone 11: Subscription Infrastructure
- [ ] Milestone 12: Legal Documentation
- [ ] Milestone 13: Infrastructure & PWA
- [ ] All compliance tests passing
- [ ] Legal review
- [ ] **GIT TAG:** "v2.0.0-compliance"

---

## Terminology Updates (Global)

| Current Term | Updated Term | Rationale |
|--------------|--------------|-----------|
| Price | Contribution | Reflects expense sharing |
| Fare | Share | Cost-sharing language |
| Book | Request Seat | Not a commercial booking |
| Invoice | Agreement | Civil agreement, not fiscal document |
| Payment | Contribution | Neutral terminology |
| Customer | Participant | Peer-to-peer relationship |
| Service | Coordination | Software coordination service |

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Regulatory inquiry | Low | Full documentation, legal citations, transparent operations |
| User confusion about pricing | Medium | Clear UI explanations, cost breakdown shown |
| Competitor analysis | Low | Open approach, network effects matter |
| Data retention compliance | Low | Automated cleanup, documented policy |

---

## Success Metrics (v2.0)

1. **100% of rides** priced at or below calculated maximum
2. **<1% data** older than 24 hours in completed ride records
3. **Subscription conversion** >5% of active users
4. **App installable** via PWA on 100% of modern browsers
5. **User understanding** - >80% of surveyed users understand cost-sharing model

---

## Agent Notes (For Future Sessions)

### Key Legal Concepts
- Cost-sharing (contribution ≤ cost) = not commercial transport
- Driver pays their share too (demonstrates peer arrangement)
- 24h data retention is GDPR compliance best practice
- Platform is "Information Society Service" (Law 10128/2009)

### Technical Notes
- Fuel prices should be updated weekly (admin or market data)
- Distance calculation needs reliable source (Google/OSM)
- Tolls are route-specific (Kalimash = 660 LEK)
- Cron jobs on Vercel have cold start considerations

### Albanian Legal Sources
- QBZ (Official Gazette): https://qbz.gov.al/
- Civil Code: Law 7850/1994
- Data Protection: Law 124/2024
- Fiscalization: Law 87/2019
- E-Commerce: Law 10128/2009
- Road Transport: Law 8308/1998
