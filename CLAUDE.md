@AGENTS.md


Here's the updated CLAUDE.md with everything we've accomplished since the last version:

```markdown
# ShopNext — AI Context Document

This document gives any AI assistant full context to continue helping with this
project. Read it entirely before responding to any question. Follow the teaching
approach described at the bottom — it is as important as the technical context.

---

## Project Overview

ShopNext is a full-stack e-commerce store built as a learning project. The goal
is not just to build a working app but to deeply understand every decision made
along the way. The developer is learning to become a job-ready fullstack
developer and wants to build a solid foundation, not just copy-paste code.

The project is currently in **Phase 4 — Authentication** (in progress — signup
is working, login and NextAuth configuration are next).

---

## Tech Stack and Why

**Next.js 16 with App Router** — handles both frontend and backend in one
project. Uses server components, API routes, and file-based routing.

**TypeScript** — used throughout. The developer is still solidifying TypeScript
fundamentals so every type decision should be explained, not assumed.

**Tailwind CSS** — for styling. The developer is learning the six-dimension
mental checklist approach (see Teaching Approach section below).

**PostgreSQL with Prisma 7.6** — database layer. We switched from MongoDB
because MongoDB Atlas had provisioning issues during setup, and PostgreSQL is
actually a better fit for the relational nature of e-commerce data.

**Neon** — cloud PostgreSQL hosting. Free tier, serverless, works perfectly
with Vercel deployment.

**NextAuth.js** — for authentication (Phase 4, partially started).

**bcryptjs** — password hashing library. Pure JavaScript implementation that
works without native compilation, making it reliable across environments
including Vercel deployment.

**Node.js v24 (LTS)** — upgraded from v20 during setup using nvm. The upgrade
was necessary because Prisma 7 sub-dependencies prefer Node 22+.

---

## Project Structure

```
shopnext/
├── prisma/
│   ├── schema.prisma        # Database models
│   ├── seed.ts              # Database seed script (uses dotenv + adapter pattern)
│   └── migrations/
├── prisma.config.ts         # Prisma 7 configuration (seed lives in migrations object)
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout - wraps every page with Navbar
│   │   ├── page.tsx         # Homepage "/"
│   │   ├── globals.css      # Global styles + Tailwind imports
│   │   ├── signup/
│   │   │   └── page.tsx     # Signup form (Client Component with useActionState)
│   │   └── products/
│   │       ├── page.tsx     # Products listing page "/products"
│   │       └── [slug]/
│   │           └── page.tsx # Product detail page "/products/wireless-headphones"
│   ├── components/
│   │   ├── Navbar.tsx       # Sticky navbar - appears on every page
│   │   └── ProductCard.tsx  # Product card component (wrapped in Link for navigation)
│   ├── generated/
│   │   └── prisma/          # Prisma-generated TypeScript client (never edit, gitignored)
│   ├── hooks/               # Custom React hooks (empty, ready for Phase 5)
│   ├── lib/
│   │   ├── prisma.ts        # Prisma singleton - single shared DB connection
│   │   └── actions/
│   │       └── auth.ts      # Server actions for signup/login ("use server" file)
│   ├── models/              # Empty, kept for reference
│   └── types/
│       └── index.ts         # All TypeScript types - single source of truth
├── .env                     # Environment variables (gitignored)
├── .gitignore               # Includes .env* wildcard - all env files protected
└── next.config.ts           # Next.js config - image domains, SVG settings
```

---

## Database Schema

The schema lives in `prisma/schema.prisma`. All models use UUID primary keys
(`@id @default(uuid())`). Here is the complete schema with relationships:

```prisma
enum Role {
  USER
  ADMIN
}

model User {
  id             String    @id @default(uuid())
  name           String
  email          String    @unique
  hashedPassword String        // Never store plain text passwords
  role           Role      @default(USER)
  createdAt      DateTime  @default(now())
  orders         Order[]
  reviews        Review[]
}

model Product {
  id          String      @id @default(uuid())
  name        String
  slug        String      @unique   // URL-friendly name e.g. "wireless-headphones"
  price       Float
  description String
  images      String[]              // Array of image URLs
  stock       Int
  category    String
  rating      Float       @default(0)  // Pre-calculated average - never compute on read
  createdAt   DateTime    @default(now())
  orderItems  OrderItem[]
  reviews     Review[]
}

model Order {
  id         String      @id @default(uuid())
  createdAt  DateTime    @default(now())
  userId     String
  user       User        @relation(fields: [userId], references: [id])
  orderItems OrderItem[]
}

model OrderItem {
  id        String  @id @default(uuid())
  quantity  Int
  price     Float   // Snapshot of price at time of purchase - prices can change
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
}

model Review {
  id        String   @id @default(uuid())
  rating    Int      // Whole numbers 1-5 only
  comment   String
  createdAt DateTime @default(now())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
}
```

**Key design decisions to remember:**
`rating` is stored as a pre-calculated field on Product rather than computed
from reviews on every read. This is a performance optimization — computing an
average across thousands of reviews on every page load would be extremely slow.
We calculate it once when a review is submitted and cache the result.

`price` on OrderItem is a snapshot of the price at purchase time. Product
prices can change later, but a historical order must always show what the
customer actually paid.

`OrderItem` exists as an intermediate table between Order and Product because
a plain many-to-many relationship cannot store extra data like quantity and
price. This pattern is called a junction table.

---

## Environment Variables

The `.env` file at the project root (not `.env.local`) contains:

```
DATABASE_URL="postgresql://...@...neon.tech/neondb?sslmode=verify-full&channel_binding=require"
NEXTAUTH_SECRET="<generated with openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
```

Important: `sslmode=verify-full` is used instead of `sslmode=require`. Using
`require` triggers a deprecation warning from the `pg` library because in the
next major version, `require` will have weaker security semantics than it does
today. `verify-full` is explicit about the desired behavior and future-proof.

The `.gitignore` uses `.env*` wildcard which protects all environment files
including `.env`, `.env.local`, `.env.development`, etc.

---

## Critical Prisma 7 Knowledge

Prisma 7 was released November 19, 2025 and has major breaking changes from v6.
Almost all tutorials, Stack Overflow answers, and blog posts online are for v5
or v6 and will not work. Always check the official docs at prisma.io/docs.

**Breaking change 1 — PrismaClient constructor:** `new PrismaClient()` no
longer works without arguments. Prisma 7 requires either a driver adapter or
an accelerateUrl. For PostgreSQL with Neon, use the `@prisma/adapter-pg`
driver adapter. The `accelerateUrl` option only works with Prisma's own
`prisma://` URLs, not with standard `postgresql://` URLs from Neon.

The correct instantiation pattern for Prisma 7 with PostgreSQL:

```typescript
import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})
const prisma = new PrismaClient({ adapter })
```

**Breaking change 2 — Import path:** In Prisma 7, the client is generated
into your project at `src/generated/prisma/client` (not imported from
`@prisma/client` as in older versions). Always import from the generated path.
Use `@/generated/prisma/client` inside `src/`, and `../src/generated/prisma/client`
for scripts outside `src/` like the seed file.

**Breaking change 3 — Seed configuration:** The seed command no longer goes
in `package.json`. It goes inside the `migrations` object in `prisma.config.ts`.
There is a TypeScript type error when placing it there (Prisma bug in their
type definitions), but it works correctly at runtime. Use `// @ts-ignore` to
suppress the error.

**Breaking change 4 — prisma.config.ts:** Database connection configuration
moved from `schema.prisma` to a new `prisma.config.ts` file at the project
root. The schema file now only contains models, no datasource URL.

**Breaking change 5 — prisma generate:** Running `prisma db push` or
`prisma migrate dev` no longer automatically runs `prisma generate`. You must
run `prisma generate` explicitly after schema changes.

The working `prisma.config.ts`:

```typescript
import "dotenv/config"
import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // @ts-ignore — Prisma 7 type definitions bug, seed belongs here at runtime
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
})
```

The seed script must import `dotenv/config` at the top and use the adapter
pattern. Run with `npx prisma db seed`. The runner is `tsx` (not `ts-node`
which has ESM module resolution issues with Prisma 7).

---

## TypeScript Types

All data types live in `src/types/index.ts`. Components and pages import from
here, never directly from Prisma. This decouples the UI from the database layer.

```typescript
export type Product = {
  id: string
  name: string
  slug: string
  price: number
  description: string
  images: string[]
  stock: number
  category: string
  rating: number
  createdAt: Date
}
```

---

## Authentication Architecture

The developer was taught authentication fundamentals from the ground up before
writing any code. Key concepts they understand:

**Password hashing with bcrypt:** Passwords are never stored as plaintext. bcrypt
is a one-way hashing function — you can go from password to hash but never
reverse. bcrypt also adds a random "salt" so the same password produces
different hashes each time. The cost factor of 12 is the industry standard
balance between security and performance. Use `bcrypt.hash(password, 12)` to
hash and `bcrypt.compare(plainText, hash)` to verify.

**Why you can't search by hashed password:** Because bcrypt incorporates a
random salt, the same password hashed twice produces different results. You
must search by email first, retrieve the stored hash, then use bcrypt.compare()
to verify. This is a critical flow detail.

**Sessions and cookies:** HTTP is stateless — every request is independent.
After login, the server creates a signed session token (signed with
NEXTAUTH_SECRET) and sends it as a cookie. The browser sends this cookie back
on every subsequent request. The server verifies the signature to confirm the
user is authenticated. NEXTAUTH_SECRET must never be exposed — anyone who knows
it can forge sessions for any user.

**Server Actions with "use server":** Next.js Server Actions are async functions
marked with the "use server" directive that run entirely on the server. Forms
can call them directly via the `action` prop without manual fetch() calls.
They have direct access to the database and environment variables.

**useActionState for form state:** When a server action needs to return data
(like error messages) back to the form, use `useActionState` from React. It
wraps the server action, captures its return value as state, and makes it
available for rendering. The action must accept `prevState` as its first
argument. The form's `action` prop expects `void | Promise<void>`, so
returning objects directly causes a TypeScript error — useActionState is the
correct solution.

**Signup flow implementation:** The signup server action lives at
`src/lib/actions/auth.ts`. It validates inputs, checks for duplicate emails,
hashes the password with bcrypt, creates the user via Prisma, and redirects
to `/login`. The signup page at `src/app/signup/page.tsx` is a Client Component
that uses `useActionState` to display validation errors.

---

## Completed Work

**Phase 1 — Project Setup** ✅
Creating the Next.js project with TypeScript, Tailwind, and App Router; setting
up the folder structure; configuring Prisma 7 with Neon PostgreSQL; creating
the Prisma singleton in `src/lib/prisma.ts`; all Git/GitHub setup with atomic
commits; upgrading Node.js from v20 to v24 using nvm.

**Phase 2 — Data Modeling** ✅
All five database models were designed collaboratively (the developer reasoned
through the relationships themselves before writing code), pushed to Neon with
`prisma db push`, and seeded with five sample products using `npx prisma db seed`.

**Phase 3 — Products Feature** ✅
- `/products` route renders a responsive grid of `ProductCard` components
  fetched from the database using a Server Component
- `ProductCard` component with Tailwind styling, next/image optimization,
  and priority prop for LCP
- Product detail page at `/products/[slug]` with dynamic routing — fetches
  product by slug using `prisma.product.findUnique()`, returns 404 via
  `notFound()` if slug doesn't exist
- `ProductCard` wrapped in `Link` for navigation to detail pages
- `Navbar` component added to `layout.tsx` (appears on every page via {children})
- Products page container styled with consistent `max-w-7xl mx-auto` pattern
- `params` in dynamic routes is a `Promise` in Next.js 15+ — must be awaited

**Phase 4 — Authentication** 🔄 In Progress
- Signup page built and tested — creates users in database with hashed passwords
- Server Actions pattern established with `useActionState` for error handling
- **Next up:** Login page, NextAuth configuration with credentials provider,
  session management, dynamic navbar (Login vs user name), protected routes

**Phases 5–8** (Cart with Zustand, Checkout & Orders, Admin Dashboard,
Deployment) are not yet started.

---

## Key Architectural Decisions

**Server Components for data fetching.** In Next.js App Router, page components
are Server Components by default. They run on the server and can query the
database directly without needing a separate API route. This means zero
client-side JavaScript for data fetching, no exposed API endpoints, and no
loading states for initial page renders. We use this pattern for all read
operations.

**Client Components only when needed.** A component is only marked "use client"
when it requires client-side interactivity (form state, event handlers, browser
APIs). The signup form is a Client Component because it needs `useActionState`
for error message rendering. The products page is a Server Component because
it only reads data and renders it.

**Prisma singleton pattern.** The `src/lib/prisma.ts` file stores a single
PrismaClient instance on the `globalThis` object during development. This
prevents Next.js hot reloads from creating hundreds of database connections.
In production, hot reloads don't happen so the singleton behavior is different.

**Types folder as single source of truth.** All TypeScript interfaces and types
live in `src/types/index.ts`. Components never import types from Prisma
directly. This means if the database layer changes, UI components are
completely unaffected.

**`next/image` over `<img>`.** Always use Next.js's Image component for
automatic optimization, WebP conversion, lazy loading, and LCP improvements.
Always include the `sizes` prop when using `fill` to help Next.js serve
appropriately sized images. Add `priority` to the first above-the-fold image.

**`Link` over `<a>` for internal navigation.** Next.js `Link` uses client-side
navigation — it intercepts clicks, fetches only changed content, and updates
without a full page reload. Plain `<a>` tags trigger full reloads that destroy
state. Use `<a>` only for external URLs leaving the application.

**Consistent container pattern.** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
is used in both the Navbar and page content containers. This ensures content
aligns to the same horizontal boundaries across the entire app.

**Dynamic routes use semantic names.** The folder `[slug]` is preferred over
`[id]` because it communicates that the segment is a human-readable URL
identifier, not a database UUID. This makes the codebase self-documenting.

**Null safety before rendering.** Database queries that might return null
(like `findUnique`) must be checked before rendering. Use `notFound()` from
`next/navigation` to show a clean 404 page instead of crashing.

---

## Git Commit History (Key Commits)

The project uses atomic commits — each commit does one thing. Commits so far:
1. initialize project and clean boilerplate
2. set up project folder structure
3. install mongoose and next-auth dependencies
4. set up Prisma with Neon PostgreSQL connection
5. define database schema with Prisma for all models
6. add database seed with five products
7. create Prisma singleton and fetch products in server component
8. add ProductCard component with Tailwind styling and image optimization
9. fix SSL mode in database connection string
10. style products page container and heading
11. add product detail page with dynamic routing and card navigation

**Note:** The signup page and server action work has NOT been committed yet.
This should be committed before moving to the login page.

---

## Developer Learning Profile

The developer is learning fullstack development with a goal of becoming
job-ready. They have some foundation in HTML, CSS, JavaScript, TypeScript,
React, Tailwind, Node.js, Express.js, MongoDB, and PostgreSQL but consider
their knowledge in all these areas not yet solid. They are currently learning
Next.js and applying that knowledge in this project.

Key learning characteristics to keep in mind: they ask excellent clarifying
questions and push back when something doesn't make sense — this should always
be encouraged. They prefer to understand the *why* before the *how* in every
situation. They have good instincts (they independently identified most of the
correct database schema fields, reasoned through relationships correctly, and
suggested checking the official Prisma docs when we were guessing). They
benefit from being challenged to attempt things before being given answers.
They suggested creating a reusable Tailwind teaching skill for use across
projects — shows forward-thinking about their learning process.

Known gaps to address throughout the project: TypeScript type system depth,
React state management patterns, CSS and Tailwind layout intuition, general
database relationship reasoning (improving rapidly), authentication concepts
(now has solid foundational understanding).

---

## Teaching Approach — Follow This Exactly

This is not optional context — it is how every interaction should be structured.

**Always explain why before how.** Before showing code or classes, explain the
concept and the reasoning. A developer who understands why `flex items-center`
works will never be stuck on a layout problem. A developer who just memorized
it will be lost when the design changes.

**Use the six-dimension Tailwind checklist.** When styling any element, work
through layout, sizing, spacing, typography, visual decoration, and
interactivity in order. For each dimension, explain the reasoning behind the
chosen classes. Never just list classes without explanation. Ask the developer
to attempt styling first using the checklist, then review dimension by
dimension — acknowledge what they got right and explain what to change and why.

**Ask the developer to attempt first.** Before giving a solution, ask them to
try. Their attempt reveals their mental model and makes corrections more
meaningful. When they attempt something, review it carefully — never just
replace it with the correct answer without explaining what was wrong and why.

**Keep steps small and atomic.** Never give a large block of work. Break every
task into the smallest possible unit that has a clear, verifiable outcome.
After each step, confirm it worked before moving to the next.

**Connect new concepts to what they already know.** When introducing something
unfamiliar, anchor it to a concept they've already understood. For example,
Server Components were anchored to the existing understanding of API calls in
traditional React. Authentication was anchored to the stateless nature of HTTP.

**Be honest about uncertainty.** When something is unclear or the answer
requires checking official documentation, say so and search rather than
guessing. The Prisma 7 situation taught us that guessing with rapidly-changing
tools wastes time and erodes trust. Always verify against official docs for
tools released in the last 12 months.

**Commit frequently with good messages.** Remind the developer to commit after
each meaningful unit of work. Commit messages should complete the sentence
"If applied, this commit will...". Reinforce atomic commit habits throughout.

**Use TypeScript errors as teaching moments.** When a TypeScript error reveals
an architectural mismatch (like the `useActionState` return type issue), explain
why TypeScript caught it, what the deeper design problem is, and how the fix
improves the architecture — not just how to silence the error.
```
