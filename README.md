# VoteBD (ভোটবিডি)

> **A clean, professional, mobile-first voting platform designed for Bangladesh.**  
> Built for class representatives (CR), student dorms, clubs, mosques, housing societies, samity committees, and quick organizational polls.

[![Tests](https://img.shields.io/badge/tests-19%20passed-brightgreen)](#testing--verification)
[![i18n](https://img.shields.io/badge/language-Bangla%20%7C%20English-006A4E)](#localization--bangladesh-context)
[![Integrity](https://img.shields.io/badge/ballot-100%25%20secret-F42A41)](#security--cryptographic-integrity)

---

## 🇧🇩 Pillars & Design Philosophy

1. **Strict Security & True Secret Ballot**:
   - The voter registry (*who voted*) and the ballot records (*which candidate was chosen*) are stored in **completely separate, unlinked tables** with zero foreign key association.
   - Server-side atomic transactions enforce strict **one-voter-one-vote**.
   - Tamper-evident cryptographic hash chain (`SHA-256`) links each ballot to the prior block.

2. **Mobile-First & Built for Bangladesh**:
   - WCAG 2.1 AA accessible with full bilingual UI: **Bangla (default)** and **English**.
   - Optional toggle for **Bangla numerals (`০১২৩৪৫৬৭৮৯` vs `0123456789`)**.
   - All schedules and dates run strictly in **Asia/Dhaka (BST, UTC+6)**.
   - Ultra-fast, lightweight bundle designed to work flawlessly on low-end Android smartphones and 3G/4G connections.
   - Large tap targets and sticky bottom action bar on mobile.

3. **Verifiable Transparency**:
   - Every voter receives an anonymous **Ballot Receipt Code** (e.g. `VBD-E7A1-420B`).
   - Voters can independently inspect `/verify` to confirm their ballot is mathematically sealed in the audit chain without exposing who they voted for.
   - Live turnout statistics, winner calculations, tie handling, and CSV export.

---

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router, Turbopack) + TypeScript
- **Styling**: Tailwind CSS + Custom Design Tokens (Bangladesh Deep Green `#006A4E` & Warm Red `#F42A41`)
- **Database**: SQLite (Local Dev) / PostgreSQL (Production) via Prisma ORM
- **Cryptography**: SHA-256 Hash Chain (`node:crypto`)
- **Visuals & Charts**: Recharts + Canvas Confetti
- **QR Codes**: `qrcode` generator
- **Icons**: Lucide React

---

## 🚀 Quick Start (Local Setup)

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd "voting system"
pnpm install
```

### 2. Environment Setup & Database Sync
Copy the example environment file:
```bash
cp .env.example .env
```
Synchronize the SQLite database with Prisma:
```bash
pnpm exec prisma db push
```

### 3. Seed Demo Election
Populate the database with the pre-configured **Class 10 CR Election** demo:
```bash
pnpm seed
```

This creates:
- **Election**: দশম শ্রেণি সিআর নির্বাচন ২০২৪ (`CR-2024`)
- **Candidates**:
  1. তানভীর আহমেদ (Tanvir Ahmed) — Roll 01 (⚽ ফুটবল)
  2. সাদিয়া জাহান (Sadia Jahan) — Roll 03 (📚 বই)
  3. মারুফ হোসেন (Maruf Hossain) — Roll 07 (🕊️ কবুতর)
  4. NOTA (None of the above)
- **Active Unused Voter Codes**: `CR-V104`, `CR-V105`, `CR-V106`, `CR-V107`, `CR-V108`
- **Admin Management PIN**: `1234`

### 4. Run Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

Run the automated test suite verifying secret ballot integrity, atomic one-vote locking, hash-chain mathematics, rate limiting, bcrypt PIN hashing, and Zod input validation:
```bash
pnpm test
```

Expected output:
```text
==========================================================
🧪 VoteBD Commercial-Grade Security & Integrity Test Suite
==========================================================

  ✓ [PASS] Demo election CR-2024 exists in database

[Test 1] Secret Ballot Architectural Independence
  ✓ [PASS] Ballot table schema has zero foreign key or reference to Voter identity

[Test 2] One-Voter-One-Vote Atomic Enforcement
  ✓ [PASS] Identified used voter record (CR-V101)
  ✓ [PASS] Second voting attempt with used voter code is strictly prevented

[Test 3] Tamper-Evident SHA-256 Hash-Chain Integrity
  ✓ [PASS] All ballots mathematically verified in cryptographic chain

[Test 4] Turnout & Tally Calculation Precision
  ✓ [PASS] Voter marked-voted count matches ballots cast in box
  ✓ [PASS] Turnout percentage calculated accurately

[Test 5] Bcrypt PIN Hashing & Verification
  ✓ [PASS] Bcrypt correctly authenticates the correct admin PIN
  ✓ [PASS] Bcrypt strictly rejects an incorrect admin PIN

[Test 6] Sliding-Window Rate Limiter Enforcement
  ✓ [PASS] Rate limiter permits requests within quota (3/3)
  ✓ [PASS] Rate limiter strictly blocks requests exceeding limit

[Test 7] Zod Schema Validation Guardrails
  ✓ [PASS] Accepts standard receipt code format VBD-XXXX-XXXX
  ✓ [PASS] Rejects malformed receipt code
  ✓ [PASS] Accepts valid vote payload with choice selection
  ✓ [PASS] Rejects empty vote payload without candidate selection

[Test 8] Cryptographically Secure Random Generators
  ✓ [PASS] Receipt format matches VBD-XXXX-XXXX
  ✓ [PASS] Sequential receipts are unique and non-colliding
  ✓ [PASS] Join code generated with expected length 6
  ✓ [PASS] Voter code uses expected prefix

==========================================================
Test Execution Finished: 19 Passed, 0 Failed
==========================================================
```

---

## 📖 End-to-End Walkthrough: Creating & Voting in a Class Election

### Scenario: High School Class Representative (CR) Election

#### Step 1: Create the Election (Under 2 minutes)
1. Go to `/elections/create` or click **"নতুন নির্বাচন তৈরি করুন"**.
2. **Basics**: Enter title e.g. `Class 10 CR Election 2024`, select `School/College`, and pick `Single Choice`.
3. **Candidates**: Enter candidate names, symbols/emojis (⚽, 📚, 🕊️), and roll numbers. Optionally enable NOTA.
4. **Rules & Schedule**: Set start and end times in BST, choose `Live Results`, and enter a 4-digit Admin PIN (e.g. `1234`).
5. **Voter Access**: Select **"Voter Roll / Code List"** and paste student rolls:
   ```text
   101 - Tanvir Ahmed
   102 - Sadia Jahan
   103 - Maruf Hossain
   ```
6. Click **"Launch Election"**.
7. You immediately get a 6-character Join Code (e.g. `CR-2024`), a downloadable QR code, and a WhatsApp share link.

#### Step 2: Students Vote (Under 30 seconds)
1. Student opens [http://localhost:3000/vote/CR-2024](http://localhost:3000/vote/CR-2024) on their phone.
2. Enters their assigned one-time code (e.g. `CR-V104`).
3. Selects their preferred candidate card on the clean ballot paper.
4. Clicks **"Review Selection"** to verify their choice.
5. Clicks **"Confirm and Cast Ballot"**.
6. The screen explodes with celebratory confetti and issues an **Anonymous Receipt Code** (e.g. `VBD-74AB-92EF`).

#### Step 3: Verify & Audit
1. The student or class teacher visits `/verify`.
2. Enters `VBD-74AB-92EF`.
3. The platform displays:
   - ✅ Status: Verified & Intact in cryptographic hash chain
   - Block Sequence number (e.g. `#4`)
   - Exact timestamp in Bangladesh Standard Time (BST)
   - *Candidate choice remains strictly hidden to protect the voter's privacy!*

#### Step 4: Admin Controls & Results
1. Organizer visits `/elections/CR-2024/admin`, logs in with PIN `1234`.
2. Inspects real-time turnout (% and count).
3. Can close the election early or extend the deadline by 1 hour / 1 day with one click.
4. Downloads the voter roll CSV or views the full audit log.
5. Direct link to `/elections/CR-2024/results` displays bar charts, winner banners, and CSV export.

---

## 🔒 Security Architecture

```
[Voter submits Code: CR-V104 + Choice: Candidate B]
                   │
                   ▼
     Atomic Database Transaction
   ┌───────────────────────────────┐
   │ 1. Verify Voter table:        │
   │    CR-V104 exists & !hasVoted │
   │ 2. Update Voter table:        │
   │    hasVoted = true, votedAt   │
   │    (Zero choice stored!)      │
   │ 3. Compute Ballot Hash:       │
   │    SHA256(prevHash + seq +    │
   │           choiceData + time)  │
   │ 4. Insert Ballot table:       │
   │    (Receipt + Hash + Choice)  │
   │    NO FOREIGN KEY TO VOTER!   │
   └───────────────────────────────┘
                   │
                   ▼
      [Receipt: VBD-74AB-92EF]
```

---

## 🌐 Deploying to Vercel (Production)

### 1. Database Configuration
For production, use a hosted PostgreSQL database (such as Supabase, Neon, or Vercel Postgres):
1. In `prisma/schema.prisma`, update the provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Set your production database URL in `.env`:
   ```bash
   DATABASE_URL="postgresql://user:password@host:5432/votebd?sslmode=require"
   ```
3. Run migrations:
   ```bash
   pnpm exec prisma db push
   ```

### 2. Vercel Deployment
1. Push your repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com).
3. Set the environment variables in the Vercel dashboard:
   - `DATABASE_URL` = Your production PostgreSQL URL
   - `NEXT_PUBLIC_APP_URL` = `https://your-domain.vercel.app`
4. Build command: `pnpm build`
5. Click **Deploy**.

---

## ⚖️ Transparency & Legal Scope

VoteBD is designed honestly and intentionally for **internal organizational, educational, and community elections** (schools, universities, clubs, mosque committees, NGOs, and cooperatives). It is **not** an official platform for government or national electoral commission elections.
