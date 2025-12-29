# Udhetim - Albanian Ridesharing Platform

A bilingual (Albanian/English) ridesharing platform for intercity travel in Albania.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your PostgreSQL credentials

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed cities
npm run db:seed

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js v5
- **Styling:** Tailwind CSS
- **i18n:** next-intl (Albanian/English)
- **Testing:** Vitest + Playwright

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm test             # Run all tests
npm run test:unit    # Run unit tests
npm run test:e2e     # Run E2E tests
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database with cities
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── [locale]/     # Localized routes (sq/en)
│   └── api/          # API routes
├── components/       # React components
├── lib/              # Utilities and config
├── services/         # Business logic
├── messages/         # i18n translations
└── types/            # TypeScript types
```

## Environment Variables

See `.env.example` for required environment variables.

## License

Private - All rights reserved
