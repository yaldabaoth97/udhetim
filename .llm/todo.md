# Hitch v2.0 - Regulatory Compliance Implementation

> Generated from: PLAN-civil-compliance.md
> Target: v2.0.0-compliance
> Execution: `/todo-all`

## Phase 1: PriceAuthority Engine [P0]

### Database Schema
- [ ] Add FuelPrice model to prisma/schema.prisma (id, pricePerLiter Int, fuelType enum DIESEL/PETROL/LPG, source String, validFrom DateTime)
- [ ] Add ComplianceConfig model to prisma/schema.prisma (id, avgConsumptionL100km Float default 8.5, wearAndTearLekKm Int default 12, legalReimbursementCap Int default 35, tollKalimash Int default 660)
- [ ] Add ComplianceStatus enum to schema (COMPLIANT, MANUAL_OVERRIDE, AUDIT_FLAGGED)
- [ ] Add compliance fields to Ride model: calculatedMaxFare Int?, distanceKm Float?, complianceStatus ComplianceStatus default COMPLIANT, driverSharePaid Boolean default false
- [ ] Run prisma migrate dev --name civil_compliance_fields
- [ ] Create seed data for ComplianceConfig with Albanian defaults

### Core Service
- [ ] Create src/lib/constants/compliance.ts with FUEL_PRICE_LEK (190), AVG_CONSUMPTION (0.085), WEAR_AND_TEAR (12), LEGAL_CAP (35), TOLL_KALIMASH (660)
- [ ] Create src/services/price-authority.service.ts with TripCostParams and FareCalculation interfaces
- [ ] Implement calculateLegalFare function: MaxContribution = (D × 0.085 × FuelPrice) + (D × 12) + Tolls, split by (passengers + 1)
- [ ] Implement getCurrentFuelPrice function that queries FuelPrice table for latest entry
- [ ] Implement getComplianceConfig function that queries ComplianceConfig table
- [ ] Implement validateFareCompliance function that returns true only if requestedPrice <= calculated max
- [ ] Add legal cap check: if perKmRate > 35, cap at 35 LEK/km

### Tests for PriceAuthority
- [ ] Create tests/unit/services/price-authority.test.ts
- [ ] Test: Tirana-Durres (36km) calculates to ~450 LEK total
- [ ] Test: Tirana-Vlora (150km) calculates to ~4000 LEK total
- [ ] Test: cost splits evenly including driver (4 people = each pays 25%)
- [ ] Test: caps at 35 LEK/km regardless of actual costs
- [ ] Test: adds Kalimash toll (660 LEK) when hasTolls=true
- [ ] Test: rejects any contribution above calculated maximum
- [ ] Test: always returns legalStatus: 'COST_SHARING_REIMBURSEMENT'

### API Endpoints
- [ ] Create src/app/api/compliance/fuel-price/route.ts - GET latest, POST new (admin)
- [ ] Create src/app/api/rides/calculate-fare/route.ts - POST with distanceKm, hasTolls, passengers returns FareCalculation

### UI Changes
- [ ] Modify src/components/forms/RideForm.tsx: remove pricePerSeat input field
- [ ] Add distance calculation on route selection (using existing location service or manual input for MVP)
- [ ] Display "Estimated Contribution: XXX LEK" (calculated, not editable)
- [ ] Show breakdown: fuel cost + wear & tear + tolls
- [ ] Update ride creation API to enforce calculatedMaxFare ceiling
- [ ] Replace "Price" labels with "Contribution" throughout app

### Terminology Updates
- [ ] Global find/replace in src/messages/en.json: "price" → "contribution", "fare" → "share", "book" → "request seat"
- [ ] Global find/replace in src/messages/sq.json: equivalent Albanian terms
- [ ] Update RideCard component labels
- [ ] Update search results labels

### Git Checkpoint
- [ ] Run full test suite
- [ ] Git commit: "feat: implement cost-sharing price calculation engine (Milestone 8)"

## Phase 2: Civil Agreement Generator [P0]

### Schema
- [ ] Add CivilAgreement model to schema: id, rideId, type String default 'MARREVESHJE_NDARJA_SHPENZIMEVE', route JSON, costBreakdown JSON, parties JSON, legalBasis JSON, generatedAt DateTime, expiresAt DateTime
- [ ] Run prisma migrate dev --name civil_agreements

### Service
- [ ] Create src/services/agreement-generator.service.ts
- [ ] Implement generateAgreement function that creates CivilAgreement from completed ride
- [ ] Include bilingual declaration (Civil Code Art. 877)
- [ ] Set expiresAt to 24 hours from generation
- [ ] NO invoice number, NO VAT, NO QR code (distinguishes from E-Fatura)

### Templates
- [ ] Add declaration text to src/messages/en.json under "legal.agreementDeclaration"
- [ ] Add Albanian declaration to src/messages/sq.json: "VËRTETIM I NDARJES SË SHPENZIMEVE TË UDHËTIMIT..."

### Components
- [ ] Create src/components/agreements/CivilAgreementCard.tsx - displays agreement with legal text
- [ ] Create src/app/[locale]/agreements/[id]/page.tsx - view single agreement (checks expiry)
- [ ] Add "View Agreement" button to completed ride view
- [ ] Show expiry countdown: "Available for X hours"

### Integration
- [ ] Trigger agreement generation when ride status changes to COMPLETED
- [ ] Add agreement link to booking confirmation

### Git Checkpoint
- [ ] Run full test suite
- [ ] Git commit: "feat: civil agreement generator for expense documentation (Milestone 9)"

## Phase 3: Data Minimization Protocol [P1]

### Schema Updates
- [ ] Add expiresAt DateTime? field to Ride model
- [ ] Add expiresAt DateTime? field to Booking model
- [ ] Run prisma migrate dev --name data_expiry_fields

### Cleanup Service
- [ ] Create src/lib/cron/data-cleanup.ts with cleanupExpiredData function
- [ ] Implement: DELETE rides WHERE status=COMPLETED AND updatedAt < NOW() - 24h
- [ ] Implement: DELETE bookings WHERE status IN (ACCEPTED,DECLINED,CANCELLED) AND updatedAt < NOW() - 24h
- [ ] Implement: DELETE searchLogs WHERE createdAt < NOW() - 7d
- [ ] Implement: DELETE civilAgreements WHERE expiresAt < NOW()

### Cron Endpoint
- [ ] Create src/app/api/cron/cleanup/route.ts - runs cleanupExpiredData
- [ ] Add authorization check (cron secret or Vercel cron header)

### Vercel Configuration
- [ ] Add cron job to vercel.json: run /api/cron/cleanup every hour

### Privacy Policy Update
- [ ] Create/update src/app/[locale]/legal/privacy/page.tsx
- [ ] Document 24-hour retention for ride data
- [ ] Document 7-day retention for search analytics
- [ ] Reference Law 124/2024 Article 5 (Data Minimization)

### UI Communication
- [ ] Add notice on ride completion: "Trip data available for 24 hours"
- [ ] Show data retention info in settings/privacy section

### Git Checkpoint
- [ ] Run full test suite
- [ ] Git commit: "feat: GDPR-compliant data retention policy (Milestone 10)"

## Phase 4: Monetization Infrastructure [P2]

### Schema
- [ ] Add SubscriptionTier enum: FREE, PRO
- [ ] Add SubscriptionStatus enum: ACTIVE, CANCELLED, PAST_DUE
- [ ] Add VerificationType enum: PHONE, ID_BASIC, ID_FULL, DRIVER
- [ ] Add Subscription model: userId unique, tier, status, stripeCustomerId?, currentPeriodStart?, currentPeriodEnd?
- [ ] Add VerificationBadge model: userId unique, type, verifiedAt, expiresAt?, verificationProvider?, verificationRef?
- [ ] Add BoostToken model: userId, quantity Int default 0
- [ ] Add relations to User model
- [ ] Run prisma migrate dev --name monetization_models

### Feature Gates
- [ ] Create src/lib/feature-gates.ts with FEATURE_LIMITS constant (FREE: 1 ride/day, PRO: unlimited)
- [ ] Implement checkFeatureAccess(userId, feature) function
- [ ] Implement getRemainingRidesToday(userId) function
- [ ] Implement canBoostRide(userId) function

### Services
- [ ] Create src/services/subscription.service.ts - create, cancel, check subscription
- [ ] Create src/services/verification.service.ts - request, check verification status

### API Endpoints
- [ ] Create src/app/api/subscriptions/route.ts - GET current, POST create
- [ ] Create src/app/api/verification/route.ts - POST request verification

### UI Components
- [ ] Create src/components/subscription/UpgradePrompt.tsx - shown when hitting limits
- [ ] Create src/components/verification/VerificationBadge.tsx - badge display
- [ ] Create src/app/[locale]/settings/subscription/page.tsx - manage subscription
- [ ] Add feature gate checks to ride creation flow
- [ ] Show "X rides remaining today" for FREE users

### Git Checkpoint
- [ ] Run full test suite
- [ ] Git commit: "feat: subscription and verification infrastructure (Milestone 11)"

## Phase 5: Legal Documentation [P1]

### Legal Citations Module
- [ ] Create src/lib/legal/citations.ts with LEGAL_CITATIONS object
- [ ] Add Civil Code Art. 877-900 citation (cost-sharing as civil contract)
- [ ] Add Law 124/2024 Art. 5 citation (data minimization)
- [ ] Add Law 87/2019 Art. 4 citation (fiscalization scope exemption)
- [ ] Add Law 10128/2009 citation (information society services)
- [ ] Add Law 8308/1998 citation (transport regulation - private vs commercial distinction)
- [ ] Add ECJ BlaBlaCar precedent reference

### Legal Pages
- [ ] Create src/app/[locale]/legal/page.tsx - main legal hub
- [ ] Create src/app/[locale]/legal/terms/page.tsx - Terms of Service
- [ ] Add Section 4.1: Nature of Fees (software license, not transport)
- [ ] Add Section 4.2: Role of Platform (information service provider)
- [ ] Update privacy policy with data retention details

### Translations
- [ ] Add all legal text to src/messages/en.json under "legal" namespace
- [ ] Add Albanian translations to src/messages/sq.json

### Footer Integration
- [ ] Add legal page links to Footer component
- [ ] Add "How Cost-Sharing Works" link to About section

### Git Checkpoint
- [ ] Run full test suite
- [ ] Git commit: "docs: legal framework documentation (Milestone 12)"

## Phase 6: Infrastructure & PWA [P2]

### PWA Configuration
- [ ] Create public/manifest.json with app metadata
- [ ] Add manifest link to src/app/layout.tsx
- [ ] Configure service worker for offline capability (optional for MVP)
- [ ] Add PWA install prompt component

### Security Headers
- [ ] Add security headers to next.config.ts (CSP, X-Frame-Options, etc.)

### Vercel Configuration
- [ ] Configure edge functions for performance
- [ ] Set up environment variables for production

### Git Checkpoint
- [ ] Run full test suite
- [ ] Git commit: "chore: infrastructure and PWA setup (Milestone 13)"

## Final Release

- [ ] Run complete E2E test suite
- [ ] Review all compliance features manually
- [ ] Update PRD.md Agent Notes with v2.0 completion
- [ ] Git tag: v2.0.0-compliance
- [ ] Deploy to production

## Notes
<!-- Agent notes during execution -->
