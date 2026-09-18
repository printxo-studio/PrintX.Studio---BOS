# 🖨️ PrintXO - Business Operating System (BOS)

**PrintXO BOS** is an end-to-end, enterprise-grade Business Operating System purpose-built for commercial 3D printing bureaus, print farms, and additive manufacturing studios.

Built with **Next.js 14 App Router**, **TypeScript**, **Prisma ORM**, and modern responsive design system aesthetics.

---

## 🌟 Key Capabilities & Modules

| Module | Features |
|---|---|
| 🎛️ **Command Center** | Real-time farm telemetry, active print jobs, urgent alerts, revenue KPIs, and queue throughput. |
| 👥 **CRM & Leads** | Customer database, lead qualification pipeline, interaction tracking, and contact management. |
| 🧮 **Quotation Engine** | Formula-driven pricing calculator (machine depreciation, filament cost, electricity, labor, failure risk markup, and GST) with printable PDF-ready quotes. |
| 📦 **Order Management** | Multi-item order workflows, status pipelines (Pending → Production → QC → Dispatch → Delivered), and one-click invoice generation. |
| 🏭 **Production & Farm Fleet** | Live printer statuses, job queuing, spool allocation, and actual vs. estimated print duration tracking. |
| 🧵 **Filament & Materials** | Spool barcode/code tracking, remaining weight monitoring, cost-per-gram calculation, drying history, and reorder alerts. |
| 📐 **Calibrations & Profiles** | OrcaSlicer / Bambu Studio print profiles, temperature/flow calibration logs, and printer tolerance tracking. |
| 🛡️ **Quality Control & CAPA** | Multi-stage inspections, defect categorization, customer complaint resolution, and 5-Why root-cause CAPA workflows. |
| 🚚 **Shipping & Logistics** | Courier dispatch management, tracking URLs, delivery status updates, and shipping cost logs. |
| 💳 **Finance & Invoicing** | Automated GST tax invoices (CGST + SGST / IGST), payment tracking (UPI, Bank Transfer), and operational expense ledger. |
| 🔬 **R&D Workspace** | Material testing experiments, parameter validation, and prototyping hypothesis tracking. |
| 📚 **SOPs & Documents Vault** | Standard Operating Procedures, machine maintenance schedules, CAD/STL file attachments, and audit history. |

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Language**: TypeScript 5
- **ORM & Database**: [Prisma ORM](https://www.prisma.io/) (SQLite for instant zero-config local setup; PostgreSQL / Supabase ready for cloud production)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Email Delivery**: [Nodemailer](https://nodemailer.com/)

---

## 🚀 Quickstart (Local Development)

### 1. Clone & Install
```bash
git clone https://github.com/<your-username>/printxo-bos.git
cd printxo-bos
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default local configuration uses SQLite:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secure-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Initialize Database & Seed
```bash
# Push Prisma schema to local SQLite database
npm run prisma:push

# Generate Prisma client
npm run prisma:generate

# Populate realistic seed data (printers, materials, spools, customers, orders, SOPs)
npm run prisma:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Production Deployment (Vercel + Supabase)

### Step 1: Database (PostgreSQL / Supabase / Neon)
1. Create a free project on [Supabase](https://supabase.com) or [Neon](https://neon.tech).
2. In `prisma/schema.prisma`, update the datasource provider from `"sqlite"` to `"postgresql"`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Set your production `DATABASE_URL` in your `.env` or deployment settings:
   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true"
   ```
4. Push the schema and seed your production database:
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

### Step 2: Deploy to Vercel
1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Add the environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (set to your Vercel URL e.g. `https://your-domain.vercel.app`)
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (optional, for email delivery)
5. Click **Deploy**.

---

## 📜 Available Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Starts Next.js development server with Turbopack |
| `npm run build` | Builds optimized production bundle |
| `npm run start` | Runs the production server |
| `npm run lint` | Runs Next.js ESLint checks |
| `npm run prisma:generate` | Regenerates Prisma Client |
| `npm run prisma:push` | Synchronizes database schema with Prisma schema |
| `npm run prisma:seed` | Seeds database with comprehensive industry-standard test dataset |

---

## 📄 License
Private & Proprietary — © 2026 PrintXO Studio. All rights reserved.
