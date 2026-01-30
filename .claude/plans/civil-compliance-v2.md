# Hitch v2.0 - Regulatory Compliance Execution Plan

> Quick reference for autonomous agent execution
> Full details: `PLAN-civil-compliance.md`

## Core Principle
```
IF Contribution <= Cost THEN Profit = 0
IF Profit = 0 THEN NOT Commercial Activity
IF NOT Commercial Activity THEN No Transport License Required
```

## Phase 1: PriceAuthority Engine [P0]

### Schema Additions
```prisma
model FuelPrice { pricePerLiter Int, fuelType FuelType, validFrom DateTime }
model ComplianceConfig { avgConsumptionL100km Float, wearAndTearLekKm Int, legalReimbursementCap Int }
// Add to Ride: calculatedMaxFare Int?, distanceKm Float?, complianceStatus ComplianceStatus
```

### Algorithm
```
MaxContribution = (D × 0.085 × FuelPrice) + (D × 12) + Tolls
PerPerson = MaxContribution / (Passengers + 1)  // Driver pays too!
CAP = 35 LEK/km maximum
```

### Tasks
- [ ] `src/services/price-authority.service.ts`
- [ ] `src/lib/constants/compliance.ts`
- [ ] `src/app/api/rides/calculate-fare/route.ts`
- [ ] Modify RideForm: remove price input, show calculated only
- [ ] Tests: Tirana-Durres=~450LEK, Tirana-Vlora=~4000LEK

## Phase 2: Civil Agreement Generator [P0]

### Document Type
```
MARREVESHJE_NDARJA_SHPENZIMEVE (Expense Sharing Agreement)
NOT an invoice - no QR, no VAT, no invoice number
```

### Tasks
- [ ] `src/services/agreement-generator.service.ts`
- [ ] `src/components/agreements/CivilAgreementCard.tsx`
- [ ] Bilingual declarations in messages/*.json
- [ ] Generate on ride completion, expire in 24h

## Phase 3: Data Minimization [P1]

### Retention Policy
```sql
-- Completed rides: 24 hours
-- SearchLog: 7 days
-- Agreements: 24 hours
```

### Tasks
- [ ] `src/lib/cron/data-cleanup.ts`
- [ ] `vercel.json` cron config
- [ ] Add `expiresAt` fields
- [ ] Update privacy policy

## Phase 4: Monetization [P2]

### Revenue Streams (Decoupled from Transport)
- Verification Badge: 500 LEK (one-time)
- Pro Subscription: €4.99/mo
- Boost Tokens: 10 for €2

### Tasks
- [ ] Subscription/VerificationBadge/BoostToken models
- [ ] `src/services/subscription.service.ts`
- [ ] `src/lib/feature-gates.ts`
- [ ] Feature gating (FREE: 1 ride/day, PRO: unlimited)

## Phase 5: Legal Docs [P1]

### Key Citations
- Civil Code Art. 877-900 (cost-sharing as civil contract)
- Law 124/2024 Art. 5 (data minimization requirement)
- Law 87/2019 Art. 4 (fiscalization scope - excludes reimbursements)
- Law 10128/2009 (platform = information society service)
- ECJ BlaBlaCar precedent (cost-sharing ≠ transport operator)

### Tasks
- [ ] `src/lib/legal/citations.ts`
- [ ] Legal/About pages with full citations
- [ ] Terms of Service (platform ≠ transport operator)

## Terminology Replacements
| Old | New |
|-----|-----|
| Price/Fare | Contribution/Share |
| Book | Request Seat |
| Invoice | Agreement |
| Payment | Contribution |
| Customer | Participant |

## Milestone Order
8. PriceAuthority Engine → 9. Agreement Generator → 10. Data Minimization → 11. Subscriptions → 12. Legal Docs → 13. Infrastructure

## Git Tags
- Current: v1.0.0 (MVP complete)
- Target: v2.0.0-compliance
