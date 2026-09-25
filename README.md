# Event Volunteer Platform

A full-stack event volunteer listing platform built with Next.js 14+, featuring a public-facing frontend for volunteers to browse and apply to opportunities, and a secure admin panel for event organizers to manage listings and leads.

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes + Server Actions
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: NextAuth.js (Credentials provider)
- **Validation**: Zod
- **Deployment**: Vercel + Supabase/PlanetScale ready

## 📋 Features

### Public Frontend
- **Home/Browse Page** (`/`) - Filterable, searchable event cards with badges (Urgent, Today, High Pay, Filled)
- **Event Detail Page** (`/events/[id]`) - Full event info, Google Maps embed, masked contact reveal, interest form
- **About Page** (`/about`) - 3-step explainer for volunteers

### Admin Panel (`/admin`)
- **Authentication** - Email/password login with NextAuth.js
- **Dashboard** - Stats overview, recent events & leads, quick actions
- **Event Management** - Full CRUD with create, edit, duplicate, delete, status management
- **Leads Management** - View all applications, status tracking (New/Contacted/Selected/Rejected), CSV export, WhatsApp integration
- **Settings** - Password change, contact masking toggle, admin user management

## 🗃 Database Schema

```prisma
model Event {
  id            String       @id @default(cuid())
  title         String
  description   String
  dateStart     DateTime
  dateEnd       DateTime?
  reportingTime String
  eventHours    String
  location      String
  mapLink       String?
  role          String
  payment       String
  perks         String?
  genderReq     String
  slotsNeeded   Int
  contact       String
  status        EventStatus  @default(ACTIVE)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  interests     Interest[]
}

model Interest {
  id           String         @id @default(cuid())
  eventId      String
  event        Event          @relation(fields: [eventId], references: [id], onDelete: Cascade)
  name         String
  phone        String
  status       InterestStatus @default(NEW)
  submittedAt  DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
}

model Admin {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum EventStatus { ACTIVE, DRAFT, CLOSED, FILLED }
enum InterestStatus { NEW, CONTACTED, SELECTED, REJECTED }
```

## 🛠 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or cloud like Supabase/PlanetScale)
- npm or yarn

### Installation

1. **Clone and install dependencies**
   ```bash
   cd event-volunteer-platform
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database URL and NextAuth secret:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/event_volunteer"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-super-secret-key-change-in-production"
   ```

3. **Set up the database**
   ```bash
   npm run db:generate  # Generate Prisma client
   npm run db:push      # Push schema to database
   npm run db:seed      # (Optional) Seed with demo data
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

### Demo Credentials
After seeding, you can log in to the admin panel at `/admin/login` with:
- **Email**: `admin@example.com`
- **Password**: `password123`

## 📁 Project Structure

```
src/
├── app/
│   ├── (public)/           # Public routes (no auth)
│   │   ├── page.tsx        # Home/Browse
│   │   ├── events/[id]/    # Event detail
│   │   └── about/          # About page
│   ├── (admin)/            # Admin routes (protected)
│   │   ├── layout.tsx      # Admin layout with sidebar
│   │   ├── login/          # Login page
│   │   ├── dashboard/      # Dashboard
│   │   ├── events/         # Event management
│   │   ├── leads/          # Lead management
│   │   └── settings/       # Settings
│   ├── api/                # API routes
│   │   ├── auth/[...nextauth]/
│   │   ├── events/
│   │   ├── interests/
│   │   └── admin/
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── providers.tsx       # Session + Toast providers
├── components/
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── auth.ts             # NextAuth config
│   ├── prisma.ts           # Prisma client
│   ├── utils.ts            # Utility functions
│   └── validations.ts      # Zod schemas
├── actions/
│   ├── events.ts           # Event server actions
│   ├── interests.ts        # Interest server actions
│   └── admin.ts            # Admin server actions
└── prisma/
    └── schema.prisma       # Database schema
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes to DB
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with demo data
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `DATABASE_URL` (from Supabase/PlanetScale)
   - `NEXTAUTH_URL` (your Vercel URL)
   - `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
4. Deploy

### Database Providers
- **Supabase**: Free PostgreSQL with connection pooling
- **PlanetScale**: MySQL-compatible with branching
- **Neon**: Serverless PostgreSQL
- **Railway**: Simple PostgreSQL hosting

## 🔐 Security Features

- Password hashing with bcryptjs (12 rounds)
- JWT-based sessions with NextAuth.js
- Protected admin routes with middleware
- Input validation with Zod
- CSRF protection via NextAuth
- SQL injection prevention via Prisma

## 📝 License

MIT License - feel free to use this for your own projects!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues and feature requests, please open a GitHub issue.