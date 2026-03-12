# 🏛️ Owerri Municipal Council — E-Certificate Platform

Official digital platform for applying, processing, and verifying Certificates of Origin issued by Owerri Municipal Council, Imo State, Nigeria.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running Locally](#running-locally)
- [Going Live (Production Deployment)](#going-live-production-deployment)
- [Switching Test Keys to Production Keys](#switching-test-keys-to-production-keys)
- [User Roles](#user-roles)
- [Adding New Certificate Types](#adding-new-certificate-types)

---

## Overview

This platform replaces the manual, paper-based Certificate of Origin process with a secure, web-based system. It supports:

- **Applicants** — Create accounts, apply online, pay via Flutterwave, track applications, and download approved certificates.
- **Admins** — Review and approve/reject applications from a dedicated dashboard.
- **Chairman** — Full oversight, admin management, signature upload, and audit logs.
- **Public** — Verify certificate authenticity by scanning QR codes.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Vanilla CSS + CSS Modules |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | NextAuth.js |
| Payments | Flutterwave |
| Email | Resend |
| PDF Generation | @react-pdf/renderer |
| QR Codes | qrcode |
| Deployment | Vercel (recommended) |

---

## Project Structure

```
owerri-ecertificate/
├── .env.example                # Template for environment variables
├── .env.local                  # Your local secrets (DO NOT COMMIT)
├── README.md                   # This file
├── prisma/
│   ├── schema.prisma           # Database schema (all tables)
│   └── seed.ts                 # Seeds initial Chairman account
├── public/
│   └── images/                 # Static assets (coat of arms, etc.)
├── src/
│   ├── app/                    # Pages + API routes (Next.js App Router)
│   │   ├── layout.tsx          # Root layout (fonts, global CSS)
│   │   ├── page.tsx            # Landing page
│   │   ├── login/              # Applicant login
│   │   ├── register/           # Applicant registration
│   │   ├── forgot-password/    # Password reset
│   │   ├── verify/             # Public certificate verification
│   │   ├── dashboard/          # Applicant dashboard (protected)
│   │   ├── admin/              # Admin panel (protected)
│   │   └── api/                # Backend API endpoints
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Buttons, cards, badges, etc.
│   │   ├── layout/             # Navbar, footer, sidebar
│   │   └── forms/              # Form components
│   ├── lib/                    # Backend utilities
│   │   ├── db.ts               # Prisma client
│   │   ├── auth.ts             # NextAuth config
│   │   ├── audit.ts            # Audit logging
│   │   ├── email.ts            # Email service
│   │   ├── flutterwave.ts      # Payment helpers
│   │   ├── certificate.ts      # PDF/hash/QR generation
│   │   └── rate-limit.ts       # Rate limiting
│   ├── styles/                 # CSS Modules
│   └── types/                  # TypeScript definitions
└── templates/                  # Certificate PDF templates
```

### How Frontend & Backend Work Together

This is a **monorepo** — frontend and backend live in the same project:

- **Pages** (`src/app/**/page.tsx`) — React components rendered as web pages.
- **API Routes** (`src/app/api/**/route.ts`) — Serverless backend functions handling database queries, payments, authentication, etc.
- **Lib** (`src/lib/`) — Shared backend utilities used by API routes.

No separate backend server is needed. Everything deploys as one unit.

---

## Prerequisites

Before you start, make sure you have:

1. **Node.js** (v18 or higher) — [Download](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **PostgreSQL** — Either:
   - Local installation: [Download](https://www.postgresql.org/download/)
   - OR a free cloud database: [Neon](https://neon.tech) (recommended)
4. **Git** (optional but recommended)

---

## Local Development Setup

### 1. Clone or open the project

```bash
cd owerri-ecertificate
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your environment file

```bash
# Copy the template
cp .env.example .env.local
```

Then open `.env.local` and fill in the values (see [Environment Variables](#environment-variables) below).

### 4. Set up the database

```bash
# Generate the Prisma client
npx prisma generate

# Create the database tables
npx prisma db push

# (Optional) Seed the initial Chairman account
npx prisma db seed
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

All secrets are stored in a single file: **`.env.local`**

| Variable | What It Does | Where to Get It |
|---|---|---|
| `DATABASE_URL` | Connects to PostgreSQL | Local: `postgresql://user:pass@localhost:5432/owerri_ecertificate` / Production: [Neon Dashboard](https://neon.tech) |
| `NEXTAUTH_SECRET` | Encrypts session tokens | Generate: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your app URL | Local: `http://localhost:3000` / Production: `https://your-domain.com` |
| `FLUTTERWAVE_SECRET_KEY` | Processes payments | [Flutterwave Dashboard](https://dashboard.flutterwave.com) → Settings → API Keys |
| `FLUTTERWAVE_PUBLIC_KEY` | Frontend payment widget | Same location as above |
| `FLUTTERWAVE_WEBHOOK_SECRET` | Validates payment webhooks | Flutterwave Dashboard → Settings → Webhooks |
| `RESEND_API_KEY` | Sends emails | [Resend Dashboard](https://resend.com/api-keys) |
| `FROM_EMAIL` | Sender email address | Your verified domain email |
| `NEXT_PUBLIC_APP_URL` | Public app URL (used in emails/QR codes) | Local: `http://localhost:3000` |
| `CERTIFICATE_HASH_SECRET` | Signs certificate hashes | Generate: `openssl rand -hex 32` |
| `BLOB_READ_WRITE_TOKEN` | File storage access | [Vercel Dashboard](https://vercel.com) → Storage → Blob |

---

## Database Setup

### Option A: Local PostgreSQL

1. Install PostgreSQL on your machine.
2. Create a database:
   ```sql
   CREATE DATABASE owerri_ecertificate;
   ```
3. Set `DATABASE_URL` in `.env.local`:
   ```
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/owerri_ecertificate"
   ```

### Option B: Neon (Cloud — Recommended)

1. Sign up at [neon.tech](https://neon.tech) (free tier available).
2. Create a new project.
3. Copy the connection string from Neon dashboard.
4. Paste into `DATABASE_URL` in `.env.local`.

### Running Migrations

```bash
# Apply schema to database
npx prisma db push

# OR use migrations (recommended for production)
npx prisma migrate dev --name init
```

---

## Running Locally

```bash
# Start development server
npm run dev

# The app will be available at:
# http://localhost:3000          — Landing page
# http://localhost:3000/login    — Applicant login
# http://localhost:3000/register — Applicant registration
# http://localhost:3000/admin/login — Admin login
# http://localhost:3000/dashboard — Applicant dashboard
# http://localhost:3000/verify?hash=xxx — Certificate verification
```

### Useful Commands

```bash
# View/edit database visually
npx prisma studio

# Reset database (DELETES ALL DATA)
npx prisma db push --force-reset

# Build production bundle (for testing)
npm run build

# Run production build locally
npm start
```

---

## Going Live (Production Deployment)

### Step 1: Deploy to Vercel

1. Push your code to a **GitHub repository**.
2. Go to [vercel.com](https://vercel.com) and sign in.
3. Click **"Add New" → "Project"**.
4. Import your GitHub repository.
5. Vercel auto-detects Next.js — click **"Deploy"**.

### Step 2: Set Up Production Database

1. Create a production database on [Neon](https://neon.tech).
2. Copy the production connection string.

### Step 3: Add Environment Variables on Vercel

1. Go to your project on Vercel → **Settings → Environment Variables**.
2. Add ALL the variables from `.env.local` with **production values** (see table below).

### Step 4: Connect Your Domain

1. Go to Vercel → **Settings → Domains**.
2. Add your domain (e.g., `certificates.owerrimunicipal.gov.ng`).
3. Update DNS records as Vercel instructs.
4. SSL is automatic.

### Step 5: Set Up Flutterwave Webhook

1. Go to Flutterwave Dashboard → **Settings → Webhooks**.
2. Set webhook URL to: `https://your-domain.com/api/payments/webhook`
3. Copy the webhook secret hash and set it as `FLUTTERWAVE_WEBHOOK_SECRET` on Vercel.

### Step 6: Run Production Migration

```bash
# From your local machine, with DATABASE_URL pointing to production:
npx prisma migrate deploy
```

---

## Switching Test Keys to Production Keys

When you're ready to go live, you need to swap test keys for production keys **in ONE place**: your environment variables (on Vercel or in `.env.local`).

| Variable | Test Value | Production Value | Where to Change |
|---|---|---|---|
| `DATABASE_URL` | Local PostgreSQL URL | Neon production connection string | Vercel → Settings → Env Vars |
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://your-domain.com` | Vercel → Settings → Env Vars |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://your-domain.com` | Vercel → Settings → Env Vars |
| `FLUTTERWAVE_SECRET_KEY` | `FLWSECK_TEST-xxx` | `FLWSECK-xxx` (no "TEST") | Vercel → Settings → Env Vars |
| `FLUTTERWAVE_PUBLIC_KEY` | `FLWPUBK_TEST-xxx` | `FLWPUBK-xxx` (no "TEST") | Vercel → Settings → Env Vars |
| `FLUTTERWAVE_WEBHOOK_SECRET` | Test webhook hash | Live webhook hash | Vercel → Settings → Env Vars |
| `RESEND_API_KEY` | Sandbox API key | Production API key | Vercel → Settings → Env Vars |
| `FROM_EMAIL` | Any verified email | `noreply@yourdomain.com` | Vercel → Settings → Env Vars |

> ⚠️ **Important:** After changing Flutterwave keys from test to live, all payments will be **real money**. Double-check everything before switching.

> 💡 **Tip:** Flutterwave test keys start with `FLWSECK_TEST-` and `FLWPUBK_TEST-`. Live keys do NOT have "TEST" in them. You can find both in: **Flutterwave Dashboard → Settings → API Keys** (toggle between Test and Live mode).

---

## User Roles

| Role | Access | How Account is Created |
|---|---|---|
| **Applicant** | Can register, apply, pay, track, download certificates | Self-registration at `/register` |
| **Admin** | Can view queue, approve/reject applications | Created by Chairman from Chairman Dashboard |
| **Chairman** | Full access: stats, admin management, audit logs, signature | Seeded via database seed script |

### Initial Chairman Account

The first Chairman account is created by the database seed script:

```bash
npx prisma db seed
```

Default credentials (change immediately after first login):
- **Username:** `chairman`
- **Password:** `ChangeMe123!`

---

## Adding New Certificate Types

The platform is designed to scale. To add a new certificate type:

1. **Add the enum value** in `prisma/schema.prisma`:
   ```prisma
   enum CertificateType {
     STATE_OF_ORIGIN
     CERTIFICATE_OF_INDIGENE  // ← Add new type
   }
   ```

2. **Add the configuration** in `src/types/index.ts`:
   ```typescript
   {
     type: 'CERTIFICATE_OF_INDIGENE',
     label: 'Certificate of Indigene',
     fee: 7500,
     requiredFields: [...],
     requiresFileUpload: true,
     requiredFileTypes: ['PASSPORT_PHOTO'],
   }
   ```

3. **Create a PDF template** in `templates/certificate-of-indigene.tsx`.

4. **Run migration:**
   ```bash
   npx prisma migrate dev --name add-indigene-cert
   ```

No other code changes needed — the form, admin panel, and payment system adapt automatically.

---

## License

© Owerri Municipal Council. All rights reserved.
