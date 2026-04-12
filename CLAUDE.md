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

The project is currently at the start of **Phase 5 — Shopping Cart**.

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

**Auth.js v5 (next-auth@beta)** — for authentication. Note: this is v5, not
v4. The API is completely different from v4. Always check Auth.js v5 docs.

**bcryptjs** — password hashing library. Pure JavaScript implementation that
works without native compilation, making it reliable across environments
including Vercel deployment.

**Node.js v24 (LTS)** — upgraded from v20 during setup using nvm.

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
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts   # NextAuth API route handler
│   │   ├── login/
│   │   │   └── page.tsx     # Login form (Client Component, reads callbackUrl)
│   │   ├── signup/
│   │   │   └── page.tsx     # Signup form (Client Component with useActionState)
│   │   └── products/
│   │       ├── page.tsx     # Products listing page "/products"
│   │       └── [slug]/
│   │           └── page.tsx # Product detail page "/products/wireless-headphones"
│   ├── components/
│   │   ├── Navbar.tsx       # Sticky navbar - Server Component, session-aware
│   │   ├── LogoutButton.tsx # Client Component - logout form with inline server action
│   │   └── ProductCard.tsx  # Product card component (wrapped in Link for navigation)
│   ├── generated/
│   │   └── prisma/          # Prisma-generated TypeScript client (never edit, gitignored)
│   ├── hooks/               # Custom React hooks (empty, ready for Phase 5)
│   ├── lib/
│   │   ├── auth.ts          # Auth.js v5 config - exports handlers, signIn, signOut, auth
│   │   ├── prisma.ts        # Prisma singleton - single shared DB connection
│   │   └── actions/
│   │       └── auth.ts      # Server actions: signupAction, loginAction, logoutAction
│   ├── models/              # Empty, kept for reference
│   └── types/
│       ├── index.ts         # All app TypeScript types - single source of truth
│       └── next-auth.d.ts   # NextAuth type extensions (adds id, role to Session/JWT/User)
├── src/proxy.ts             # Next.js 16 route protection (renamed from middleware.ts)
├── .env                     # Environment variables (gitignored)
├── .gitignore               # Includes .env* wildcard - all env files protected
└── next.config.ts           # Next.js config - image domains, SVG settings
```

---

## Database Schema

The schema lives in `prisma/schema.prisma`. All models use UUID primary keys
(`@id @default(uuid())`). Here is the complete schema:

```prisma
enum Role {
  USER
  ADMIN
}

model User {
  id             String    @id @default(uuid())
  name           String
  email          String    @unique
  hashedPassword String
  role           Role      @default(USER)
  createdAt      DateTime  @default(now())
  orders         Order[]
  reviews        Review[]
}

model Product {
  id          String      @id @default(uuid())
  name        String
  slug        String      @unique
  price       Float
  description String
  images      String[]
  stock       Int
  category    String
  rating      Float       @default(0)
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
  price     Float
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
}

model Review {
  id        String   @id @default(uuid())
  rating    Int
  comment   String
  createdAt DateTime @default(now())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  productId String
  product   Product  @relation(fields: [productId], references: [id])
}
```

Key design decisions: `rating` is pre-calculated on Product rather than
computed from reviews on every read — performance optimization. `price` on
OrderItem is a snapshot of price at purchase time. `OrderItem` is a junction
table between Order and Product carrying quantity and price.

---

## Environment Variables

The `.env` file at the project root (not `.env.local`) contains:

```
DATABASE_URL="postgresql://...@...neon.tech/neondb?sslmode=verify-full&channel_binding=require"
AUTH_SECRET="<generated with openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
```

`sslmode=verify-full` is used instead of `sslmode=require` to avoid a pg
library deprecation warning. Auth.js v5 uses `AUTH_SECRET` not
`NEXTAUTH_SECRET` — this naming change caused a silent JWT signing failure
during development.

---

## Critical Prisma 7 Knowledge

Prisma 7 (released November 19, 2025) has major breaking changes from v6.
Almost all tutorials online are for older versions and will not work.

`new PrismaClient()` without arguments no longer works. Must use a driver
adapter. For PostgreSQL with Neon use `@prisma/adapter-pg`:

```typescript
import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })
```

Import path is `@/generated/prisma/client` (inside src/) or
`../src/generated/prisma/client` (outside src/ like seed scripts). Never from
`@prisma/client`.

Seed command goes inside the `migrations` object in `prisma.config.ts` — there
is a TypeScript type error there (Prisma bug), suppress with `// @ts-ignore`.
Use `tsx` as the runner, not `ts-node`. Running `prisma db push` or
`prisma migrate dev` no longer auto-runs `prisma generate` — run it explicitly.

---

## Critical Auth.js v5 Knowledge

Auth.js v5 (next-auth@beta) has breaking changes from v4. Most tutorials are
for v4 and will not work.

The configuration exports `{ handlers, signIn, signOut, auth }` from a single
`src/lib/auth.ts` file. The environment variable is `AUTH_SECRET` not
`NEXTAUTH_SECRET`. The API route re-exports the handlers at
`src/app/api/auth/[...nextauth]/route.ts`.

For server-side signout, import `signOut` from `@/lib/auth` and call it inside
a function with `"use server"`. The `signOut` from `next-auth/react` is
client-side only and throws if called from server code.

`redirect()` from `next/navigation` works by throwing a special internal error.
Any `try/catch` that wraps code calling `redirect()` must only catch `AuthError`
and rethrow everything else — otherwise the redirect gets swallowed:

```typescript
try {
  await signIn("credentials", { email, password, redirect: false })
} catch (error) {
  if (error instanceof AuthError) {
    return { error: "Invalid email or password" }
  }
  throw error  // let redirect() propagate
}
redirect("/products")
```

---

## Critical Next.js 16 Knowledge

Next.js 16 renamed `middleware.ts` to `proxy.ts`. The old filename is silently
ignored — no error is thrown, the file just doesn't run. This caused route
protection to appear completely broken with no diagnostic output.

The new proxy uses Node.js runtime (not Edge runtime), so `await auth()` can
be called directly. The export must be a named `export async function proxy(req)`
not `export default`.

```typescript
// src/proxy.ts
import { auth } from "./lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicRoutes = ["/", "/products", "/login", "/signup"]

export async function proxy(req: NextRequest) {
  const session = await auth()
  const isLoggedIn = !!session
  const { pathname } = req.nextUrl
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/products")
  )
  if (!isPublicRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
}
```

---

## Authentication Architecture

The developer was taught authentication from the ground up and understands
all core concepts: password hashing with bcrypt (one-way, salted, cost factor
12), why you search by email then compare hashes rather than searching by hash,
how JWT sessions work with cookies across stateless HTTP requests, and the
security reason for never revealing whether email or password specifically was
wrong (user enumeration prevention).

Signup flow: validate inputs → check for duplicate email → hash password with
bcrypt → create user with Prisma → redirect to `/login`.

Login flow: validate inputs → call `signIn("credentials", ...)` → Auth.js
calls `authorize()` in `src/lib/auth.ts` → finds user by email, compares
password with bcrypt, returns user object or null → on success creates JWT
cookie → redirects to `callbackUrl` or `/products`.

The `callbackUrl` flow: proxy detects unauthenticated request → redirects to
`/login?callbackUrl=/cart` → login page reads param and embeds as hidden form
field → login action reads from FormData → redirects to `callbackUrl`
(validated to be local path only, preventing open redirect attacks).

Navbar is a Server Component that calls `auth()` — shows user's first name and
LogoutButton when session exists, Login link when not. LogoutButton is a Client
Component with an inline server action calling `signOut`.

---

## TypeScript Types

```typescript
// src/types/index.ts
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

export type AuthResponse = {
  error?: string
  success?: boolean
} | null
```

Auth.js types extended in `src/types/next-auth.d.ts` to add `id` and `role`
to `User`, `Session`, and `JWT` interfaces.

---

## Tailwind Teaching Skill

A reusable `.skill` file was created and packaged for the developer using the
six-dimension mental checklist approach (layout, sizing, spacing, typography,
visual decoration, interactivity). Install via Claude.ai Settings → Skills →
Install Skill.

---

## Completed Work

**Phase 1 — Project Setup** ✅ Next.js 16, TypeScript, Tailwind, App Router,
Prisma 7 with Neon PostgreSQL, Prisma singleton, Git/GitHub, Node.js v24.

**Phase 2 — Data Modeling** ✅ Five database models designed collaboratively,
pushed to Neon, seeded with five sample products.

**Phase 3 — Products Feature** ✅ Products listing page with responsive grid,
ProductCard with Tailwind styling and image optimization, product detail page
at `/products/[slug]` with dynamic routing and notFound() for missing slugs,
Navbar in layout.tsx, consistent max-w-7xl container pattern.

**Phase 4 — Authentication** ✅ Complete end-to-end authentication: signup
with bcrypt hashing, login with Auth.js v5 credentials provider, JWT sessions,
dynamic session-aware Navbar, route protection via proxy.ts, correct post-login
redirect to callbackUrl. Major debugging episodes resolved: wrong next-auth
version (v4 vs v5), AUTH_SECRET vs NEXTAUTH_SECRET naming, redirect() swallowed
by catch blocks, Next.js 16 middleware → proxy rename.

**Phase 5 — Shopping Cart** 🔄 Not yet started.

**Phases 6–8** (Checkout & Orders, Admin Dashboard, Deployment) not started.

---

## Key Architectural Decisions

Server Components for all data fetching — pages query Prisma directly without
API routes. Client Components only when interactivity is required. Prisma
singleton on `globalThis` prevents connection pool exhaustion during hot
reloads. Types folder as single source of truth — UI never imports from Prisma.
`next/image` always over `<img>` with `sizes` prop and `priority` on LCP image.
`Link` always over `<a>` for internal navigation. Consistent `max-w-7xl mx-auto
px-4 sm:px-6 lg:px-8` container pattern. Semantic route names (`[slug]` not
`[id]`). Null safety before rendering — `findUnique` results always checked.

---

## Git Commit History (Key Commits)

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
12. add signup page with server action and bcrypt password hashing
13. add authentication with NextAuth v5, signup and login flows
14. add dynamic navbar with session-aware login and logout
15. add route protection with Next.js 16 proxy middleware
16. fix post-login redirect to honor callbackUrl from protected routes

---

## Developer Learning Profile

The developer is learning fullstack development with a goal of becoming
job-ready. They have foundational knowledge across the full stack but consider
it not yet solid in any area.

Key strengths: asks excellent clarifying questions, pushes back when something
doesn't make sense, has good instincts for database design and component
structure, independently reasoned through schema relationships, suggested
searching official docs instead of guessing (saved significant debugging time),
created a reusable Tailwind teaching skill showing forward planning, built the
login page and logout button independently before being asked. Learning rapidly
— each phase shows noticeably more confidence and independence.

Active gaps: TypeScript type system depth, React state management (Phase 5
addresses this with Zustand), Tailwind layout intuition (improving through
six-dimension checklist practice).

---

## Teaching Approach — Follow This Exactly

Always explain why before how. A developer who understands why something works
will never be stuck when requirements change.

Use the six-dimension Tailwind checklist for every styling task: layout, sizing,
spacing, typography, visual decoration, interactivity — in that order, with
reasoning for each. Always ask the developer to attempt styling first, then
review dimension by dimension acknowledging correct decisions and explaining
corrections with reasons.

Ask the developer to attempt every task before giving solutions. The attempt
reveals their mental model and makes corrections meaningful. Never replace an
attempt with the correct answer without explaining what was wrong and why.

Keep steps small and atomic. One clear task at a time with a verifiable outcome.
Confirm it worked before moving to the next step.

Connect new concepts to what they already know. Authentication was anchored to
HTTP's statelessness. Server Components were anchored to traditional API calls.

Be honest about uncertainty. Search official docs for tools released in the
last 12 months. Guessing with Prisma 7, Auth.js v5, and Next.js 16 all wasted
significant time — the lesson was learned through experience.

Commit frequently with good messages following "If applied, this commit will..."
format. Reinforce atomic commit habits throughout.

Use TypeScript errors as teaching moments — explain why TypeScript caught the
issue and what the deeper architectural problem is, not just how to silence it.