# Hitch - Albanian Ridesharing Platform

A bilingual (Albanian/English) ridesharing platform for intercity travel in Albania. Drivers post rides, riders search and book seats, and everyone saves money while reducing traffic.

## Features

- **User Authentication** - Email/password registration with secure bcrypt hashing
- **Ride Management** - Post, edit, and cancel rides with origin/destination, time, price, seats
- **Booking System** - Request seats, accept/decline bookings, manage passengers
- **Search & Discovery** - Find rides by city, date; city autocomplete with locale support
- **Driver Analytics** - See top searched routes and underserved markets
- **Bilingual Interface** - Full Albanian (sq) and English (en) support
- **Responsive Design** - Works on desktop and mobile

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your database credentials

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed Albanian cities
npm run db:seed

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL + Prisma 5 |
| Authentication | NextAuth.js v5 |
| Styling | Tailwind CSS |
| Internationalization | next-intl |
| Testing | Vitest (123 tests) |
| Validation | Zod |

## Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── [locale]/            # Localized routes (sq/en)
│   │   ├── rides/           # Ride search, detail, create, edit
│   │   ├── bookings/        # My bookings page
│   │   ├── dashboard/       # Driver dashboard (rides, analytics)
│   │   └── auth/            # Login, register pages
│   └── api/                 # API routes
│       ├── rides/           # CRUD, search, my-rides
│       ├── bookings/        # Create, accept, decline, cancel
│       ├── cities/          # City autocomplete
│       └── analytics/       # Route analytics
├── components/              # React components
│   ├── layout/              # Header, navigation
│   └── providers/           # Session provider
├── lib/                     # Utilities and config
│   ├── auth.ts              # NextAuth configuration
│   ├── prisma.ts            # Prisma client
│   ├── validation.ts        # Zod schemas
│   └── utils.ts             # Currency formatting, dates
├── services/                # Business logic
│   ├── auth.service.ts      # Registration, password hashing
│   ├── ride.service.ts      # Ride CRUD operations
│   ├── booking.service.ts   # Booking state management
│   └── search.service.ts    # Search logging, analytics
├── messages/                # i18n translations
│   ├── sq.json              # Albanian
│   └── en.json              # English
└── i18n/                    # next-intl configuration
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth.js handlers

### Rides
- `GET /api/rides` - Search rides (query params: origin, destination, date, page, limit, sortBy, sortOrder)
- `POST /api/rides` - Create ride (auth required)
- `GET /api/rides/[id]` - Get ride details
- `PUT /api/rides/[id]` - Update ride (driver only)
- `DELETE /api/rides/[id]` - Cancel ride (driver only)
- `GET /api/rides/my-rides` - Get driver's rides (auth required)
- `GET /api/rides/[id]/bookings` - Get bookings for ride (driver only)

### Bookings
- `GET /api/bookings` - Get rider's bookings (auth required)
- `POST /api/bookings` - Create booking request (auth required)
- `GET /api/bookings/[id]` - Get booking details
- `POST /api/bookings/[id]/accept` - Accept booking (driver only)
- `POST /api/bookings/[id]/decline` - Decline booking (driver only)
- `POST /api/bookings/[id]/cancel` - Cancel booking (rider only)

### Other
- `GET /api/cities` - City autocomplete (query params: q, locale)
- `GET /api/analytics/routes` - Route analytics (query params: days, limit)

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/hitch"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"  # Generate with: openssl rand -base64 32
```

## Database Schema

### Key Models
- **User** - id, email, passwordHash, name, phone, locale
- **Ride** - id, driverId, origin/destination cities, departureTime, pricePerSeat, seats, status
- **Booking** - id, rideId, riderId, seatsRequested, status (PENDING/ACCEPTED/DECLINED/CANCELLED)
- **SearchLog** - Analytics for route demand
- **City** - Albanian cities with sq/en names for autocomplete

## Scripts

```bash
npm run dev          # Start development server (Turbopack)
npm run build        # Build for production
npm run start        # Start production server
npm test             # Run all tests (Vitest)
npm run lint         # Run ESLint
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma migrate dev   # Run migrations
npx prisma db seed   # Seed cities
```

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Vercel auto-detects Next.js and deploys

### Manual Deployment
```bash
npm run build
npm run start
```

## Currency

All prices are in Albanian Lek (ALL). The `formatALL()` utility formats amounts as "1.500 Lek".

## Phone Validation

Albanian phone numbers must match format: `+355 XX XXX XXXX` (e.g., `+355 69 123 4567`)

## Booking Flow

1. Rider searches for rides
2. Rider requests booking (specifies seats, optional message)
3. Driver receives notification (AC-09 - future: email)
4. Driver accepts or declines
5. If accepted: seats decrease, rider can see driver contact
6. If declined: rider can book another ride

## Analytics

Drivers can view:
- **Top Routes** - Most searched origin-destination pairs
- **Underserved Routes** - High search volume, low ride supply (opportunities)

## Testing

```bash
npm test                    # Run all tests
npm test -- --coverage      # With coverage report
npm test -- --watch         # Watch mode
```

123 tests covering:
- Authentication (registration, password hashing)
- Validation (Zod schemas for users, rides)
- Services (ride CRUD, booking state machine, search)

## License

Private - All rights reserved
