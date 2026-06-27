@AGENTS.md


Here's the updated CLAUDE.md with everything we've accomplished since the last version:

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

The project has completed **Phase 6 — Checkout & Orders**. The main checkout,
order persistence, order confirmation, and order history flow is implemented.

---

## Tech Stack and Why

**Next.js 16 with App Router** — handles both frontend and backend in one
project. Uses server components, API routes, and file-based routing.

**TypeScript** — used throughout. The developer is still solidifying TypeScript
fundamentals so every type decision should be explained, not assumed.

**Tailwind CSS** — for styling. The developer is learning the six-dimension
mental checklist approach (see Teaching Approach section below).

**PostgreSQL with Prisma 7.6** — database layer. Switched from MongoDB because
MongoDB Atlas had provisioning issues and PostgreSQL is a better fit for the
relational nature of e-commerce data.

**Neon** — cloud PostgreSQL hosting. Free tier, serverless, works perfectly
with Vercel deployment.

**Auth.js v5 (next-auth@beta)** — for authentication. This is v5, not v4.
The API is completely different from v4. Always check Auth.js v5 docs.

**bcryptjs** — password hashing. Pure JavaScript, works without native
compilation, reliable on Vercel deployment.

**Zustand v5.0.12** — client-side state management for the shopping cart.
Lightweight, minimal boilerplate, built-in persist middleware for localStorage.

**Node.js v24 (LTS)** — upgraded from v20 during setup using nvm.

---

## Project Structure

```
shopnext/
├── prisma/
│   ├── schema.prisma        # Database models
│   ├── seed.ts              # Seed script (uses dotenv + adapter pattern)
│   └── migrations/
├── generated/               # Prisma-generated client (moved OUT of src/ to fix memory leak)
│   └── prisma/
├── prisma.config.ts         # Prisma 7 configuration
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
│   │   ├── cart/
│   │   │   └── page.tsx     # Cart page (Client Component, reads Zustand store)
│   │   ├── checkout/
│   │   │   └── page.tsx     # Checkout page (Client Component, bridges cart to orders)
│   │   ├── orders/
│   │   │   ├── page.tsx     # Order history page for logged-in user
│   │   │   └── [orderId]/
│   │   │       └── page.tsx # Order confirmation/details page
│   │   └── products/
│   │       ├── page.tsx     # Products listing page "/products"
│   │       └── [slug]/
│   │           └── page.tsx # Product detail page "/products/wireless-headphones"
│   ├── components/
│   │   ├── Navbar.tsx       # Sticky navbar - Server Component, session-aware
│   │   ├── CartCount.tsx    # Client Component - reads cart count from Zustand
│   │   ├── CartItemRow.tsx  # Client Component - renders one cart item with controls
│   │   ├── LogoutButton.tsx # Client Component - logout form with inline server action
│   │   ├── AddToCartButton.tsx # Client Component - calls useCartStore addItem
│   │   └── ProductCard.tsx  # Product card (wrapped in Link for navigation)
│   ├── hooks/
│   │   └── useCartStore.ts  # Zustand cart store with persist middleware
│   ├── lib/
│   │   ├── auth.ts          # Auth.js v5 config - exports handlers, signIn, signOut, auth
│   │   ├── prisma.ts        # Prisma singleton - single shared DB connection
│   │   └── actions/
│   │       ├── auth.ts      # Server actions: signupAction, loginAction, logoutAction
│   │       └── order.ts     # Server action: placeOrderAction
│   ├── models/              # Empty, kept for reference
│   └── types/
│       ├── index.ts         # All app TypeScript types - single source of truth
│       └── next-auth.d.ts   # NextAuth type extensions (id, role on Session/JWT/User)
├── src/proxy.ts             # Next.js 16 route protection (renamed from middleware.ts)
├── .env                     # Environment variables (gitignored)
├── .gitignore               # Includes .env* wildcard - all env files protected
└── next.config.ts           # Next.js config - image domains, SVG settings
```

---

## Database Schema

All models use UUID primary keys (`@id @default(uuid())`).

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
  price     Float   // Snapshot of price at purchase time
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

Key decisions: `rating` is pre-calculated on Product (performance). `price` on
OrderItem is a price snapshot. `OrderItem` is a junction table carrying quantity
and price between Order and Product.

---

## Environment Variables

```
DATABASE_URL="postgresql://...@...neon.tech/neondb?sslmode=verify-full&channel_binding=require"
AUTH_SECRET="<generated with openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
```

`sslmode=verify-full` avoids pg library deprecation warning. Auth.js v5 uses
`AUTH_SECRET` not `NEXTAUTH_SECRET` — this caused a silent JWT signing failure.

---

## Critical Prisma 7 Knowledge

Released November 19, 2025. Breaking changes from v6 — most tutorials won't work.

`new PrismaClient()` requires a driver adapter. For PostgreSQL with Neon:

```typescript
import { PrismaClient } from "../../generated/prisma/client"  // NOTE: moved outside src/
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })
```

IMPORTANT: The generated Prisma client was moved from `src/generated/prisma`
to `generated/prisma` at the project root (outside src/). This was done to fix
a memory leak — Turbopack was treating the generated files as watched application
source code, causing 2+ GB RAM usage during development. The import paths in
all files must reflect this — use `../../generated/prisma/client` or a path
alias pointing outside src/.

Seed command is inside `migrations` object in `prisma.config.ts` with
`// @ts-ignore` for the TypeScript bug. Use `tsx` as runner. Running
`prisma db push` or `prisma migrate dev` does NOT auto-run `prisma generate`.

---

## Critical Auth.js v5 Knowledge

Configuration exports `{ handlers, signIn, signOut, auth }` from `src/lib/auth.ts`.
Environment variable is `AUTH_SECRET`. API route at
`src/app/api/auth/[...nextauth]/route.ts` re-exports the handlers.

`signOut` from `@/lib/auth` is server-side. `signOut` from `next-auth/react`
is client-side only — throws if called from server code.

`redirect()` works by throwing a special internal error. Any `try/catch` must
only catch `AuthError` and rethrow everything else:

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

Next.js 16 renamed `middleware.ts` to `proxy.ts`. Old filename silently ignored.
Export must be named `export async function proxy(req)` not `export default`.
Uses Node.js runtime (not Edge), so `await auth()` works but causes memory
issues — use lightweight cookie check instead:

```typescript
// src/proxy.ts - LIGHTWEIGHT VERSION (no auth() import)
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicRoutes = ["/", "/products", "/login", "/signup"]

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/products")
  )

  if (isPublicRoute) return NextResponse.next()

  // Optimistic cookie check — no cryptographic verification here.
  // Full JWT verification happens in Server Components via auth().
  const sessionCookie =
    req.cookies.get("authjs.session-token") ||
    req.cookies.get("__Secure-authjs.session-token")

  if (!sessionCookie) {
    const loginUrl = new URL("/login", req.nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
}
```

IMPORTANT: Do NOT import `auth` from `@/lib/auth` in proxy.ts. This caused
2+ GB memory usage in development because it loaded Prisma + bcrypt on every
single request. The lightweight cookie check is the correct pattern.

---

## Memory Leak Fix (Dev Server)

Three fixes were applied to solve 2+ GB RAM usage during development:

1. **Lightweight proxy** — removed `auth()` call from proxy.ts, replaced with
   cookie existence check. No more Prisma/bcrypt loading on every request.

2. **Move Prisma client outside src/** — changed generator output from
   `src/generated/prisma` to `generated/prisma` (project root). Turbopack no
   longer watches it as application source code.

3. **Split auth config** — Prisma and bcrypt are only loaded for credential
   sign-in, not for every proxied request.

---

## Zustand Cart Store

```typescript
// src/hooks/useCartStore.ts
// CartStore type has: items, addItem, removeItem, updateQuantity, clearCart
// Uses persist middleware with localStorage key "shopnext-cart"
// storage: createJSONStorage(() => localStorage) — function wrapper defers
// access until browser runs, preventing SSR crashes on the server
```

Key behaviors: `addItem` upserts (increments quantity if product already in
cart). `updateQuantity` removes item when quantity reaches 0. `clearCart`
empties the entire cart — called after successful checkout.

In Zustand v5, when selecting multiple values using a selector that returns
an object or array, wrap with `useShallow` to prevent infinite re-render loops.

---

## Authentication Architecture

Signup: validate → check duplicate email → hash with bcrypt (cost 12) →
create user → redirect to `/login`.

Login: validate → `signIn("credentials", ...)` → `authorize()` in auth.ts →
find user by email → `bcrypt.compare()` → return user or null → JWT cookie →
redirect to `callbackUrl` or `/products`.

callbackUrl flow: proxy detects unauth request → `/login?callbackUrl=/cart` →
login page embeds as hidden field → action reads from FormData → redirects to
callbackUrl (validated as local path only — prevents open redirect attacks).

Navbar: Server Component calling `auth()` — shows user first name + LogoutButton
when session exists, Login link when not. LogoutButton is Client Component with
inline server action.

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

export type CartItem = {
  productId: string  // DB ID — prevents duplicate cart entries
  name: string
  price: number
  image: string      // First image URL only
  slug: string       // For linking back to product detail page
  quantity: number
}

export type AuthResponse = {
  error?: string
  success?: boolean
} | null

export type Order = {
  id: string
  userId: string
  createdAt: Date
  orderItems: OrderItem[]
}

export type OrderItem = {
  id: string
  price: number
  quantity: number
  orderId: string
  productId: string
  product: {
    name: string
    slug: string
    images: string[]
  }
}
```

Auth.js types in `src/types/next-auth.d.ts` extend `User`, `Session`, and
`JWT` interfaces to add `id` and `role`.

---

## Tailwind Teaching Skill

A reusable `.skill` file was created with the six-dimension mental checklist
(layout, sizing, spacing, typography, visual decoration, interactivity).
Install via Claude.ai Settings → Skills → Install Skill.

---

## Completed Work

**Phase 1 — Project Setup** ✅
Next.js 16, TypeScript, Tailwind, App Router, Prisma 7 with Neon PostgreSQL,
Prisma singleton, Git/GitHub, Node.js v24.

**Phase 2 — Data Modeling** ✅
Five database models designed collaboratively, pushed to Neon, seeded with
five sample products.

**Phase 3 — Products Feature** ✅
Products listing page with responsive grid, ProductCard with Tailwind styling
and image optimization, product detail page at `/products/[slug]` with dynamic
routing and notFound() for missing slugs, Navbar in layout.tsx, consistent
max-w-7xl container pattern.

**Phase 4 — Authentication** ✅
Complete end-to-end authentication: signup with bcrypt, login with Auth.js v5
credentials provider, JWT sessions, dynamic session-aware Navbar, route
protection via proxy.ts, correct post-login redirect to callbackUrl.
Major debugging: wrong next-auth version (v4 vs v5), AUTH_SECRET vs
NEXTAUTH_SECRET naming, redirect() swallowed by catch blocks, Next.js 16
middleware → proxy rename.

**Phase 5 — Shopping Cart** ✅
- Installed Zustand v5.0.12
- Added CartItem type to src/types/index.ts
- Created useCartStore (items, addItem, removeItem, updateQuantity, clearCart)
  with persist middleware at src/hooks/useCartStore.ts
- Created AddToCartButton component (Client Component, uses Omit<CartItem, "quantity">)
- Updated product detail page to use AddToCartButton
- Updated Navbar with CartCount Client Component showing item count badge
- Built cart page at src/app/cart/page.tsx (Client Component)
- Built CartItemRow component with quantity controls and remove button
- Commit: "feat: implement persistent shopping cart with Zustand, dynamic
  totals, and responsive cart page"

Also applied memory leak fixes during Phase 5:
- Moved Prisma client outside src/ to generated/
- Switched proxy.ts to lightweight cookie check
- Commit: "refactor and feature: optimize auth architecture and move prisma
  out of src to fix memory leaks"

**Phase 6 — Checkout & Orders** ✅
- Added `Order` and `OrderItem` app-level display types.
- Added `/checkout` Client Component reading Zustand cart state.
- Added `placeOrderAction` in `src/lib/actions/order.ts`.
- Checkout submits cart JSON to the server action, creates an Order with nested
  OrderItem rows, decrements product stock, clears the Zustand cart on success,
  and redirects to `/orders/[orderId]`.
- Added `/orders/[orderId]` Server Component confirmation/details page.
- Added `/orders` Server Component order history page filtered by current user.
- Added logged-in-only Orders link in Navbar.

**Phases 7** (Admin Dashboard) status: doing now

-[ x ] Step 1: Promote yourself to ADMIN inside the database.

-[ x ] Step 2: Restore the lightweight, high-performance cookie check in src/proxy.ts.

-[ x ] Step 3: Build src/app/admin/layout.tsx with the authoritative auth() role gate using notFound().

-[ x ] Step 4: Build the Admin Dashboard Homepage showing aggregate stats (count(), aggregate()).

-[ x ] Step 5: Build the dense Admin Products Table listing.

-[ x ] Step 6: Build the "Create Product" Server form using text field image URLs.

-[ x ] Step 7: Build the "Edit Product" Server form pre-filled with relational data.

-[ x ] Step 8: Build the secure Delete action featuring our order-history block guard.

-[ x ] Step 9: Build the comprehensive Admin Orders View showing unified user and product data.

-[ x ] Step 10: Add the conditional Admin link to your shared Navbar.


**Phase 8: Deployment** status: not started yet

---

## Phase 6 Implementation Notes — Checkout & Orders

The checkout flow converges every layer built so far: authentication, database,
state management, and server actions.

Three responsibilities: (1) collecting order details from Zustand cart store,
(2) processing the order — creating Order + OrderItem records in PostgreSQL,
(3) showing confirmation. No real payment processing — clicking "Place Order"
creates the order directly as if payment was approved.

Implemented flow:
- `/checkout` is a Client Component that reads `items` and `clearCart` from
  `useCartStore`, displays the order summary, collects placeholder shipping
  fields, calls `placeOrderAction(JSON.stringify(items))`, clears the cart on
  success, and routes to `/orders/[orderId]`.
- `placeOrderAction` authenticates via `auth()`, parses cart JSON, validates
  the cart is non-empty, rejects invalid quantities (`<= 0` or non-integers),
  checks each product exists and has enough stock, snapshots authoritative
  database prices instead of client cart prices, decrements stock inside a
  Prisma transaction, creates one Order row linked to the current user, and
  creates nested OrderItem rows.
- `/orders/[orderId]` checks the session, redirects unauthenticated users to
  `/login?callbackUrl=/orders`, fetches one order with nested
  `orderItems.product` data, returns `notFound()` when the order is missing or
  owned by a different user, and displays confirmation, item list, tax,
  shipping, and total.
- `/orders` fetches orders belonging to the logged-in user, newest first, and
  displays item count, total paid, date, and links to each order detail page.
- Navbar shows an `Orders` link only when `session?.user` exists.

Future cleanup/improvements:
- `/checkout` currently shows an empty-cart helper instead of redirecting to
  `/products`. This is acceptable UX, but differs from the original Task 10
  wording.
- Remove or finish `src/app/test/page.tsx` before committing if it was only a
  scratch checkout prototype.
- Clean up lint warnings: unused `err` in checkout and unused imports in
  `src/types/next-auth.d.ts`.
- Run `npm run build` under Node >= 20.9.0.

---

## Key Architectural Decisions

Server Components for all data fetching — pages query Prisma directly without
API routes. Client Components only when interactivity is required. Prisma
singleton on `globalThis` prevents connection pool exhaustion during hot reloads.
Types folder as single source of truth — UI never imports from Prisma. `next/image`
always over `<img>` with `sizes` prop and `priority` on LCP image. `Link` always
over `<a>` for internal navigation. Consistent `max-w-7xl mx-auto px-4 sm:px-6
lg:px-8` container pattern. Semantic route names (`[slug]` not `[id]`). Null
safety before rendering — `findUnique` results always checked before use.
Server/Client component composition — keep parent as Server Component, extract
only the interactive piece into a small Client Component (LogoutButton, CartCount,
AddToCartButton all follow this pattern).

---

## Git Commit History

1f47ef8 Initial commit from Create Next App
1a68579 Initialize project and clear boilerplate
1abc940 Install mongoose and next-auth dependencies
726b223 Setup Prisma with Neon Postgresql Connection
1fb0045 Define database schema with Prisma for all models
fb04c27 Add database seed with five products
3316ae0 Create Prisma singleton and fetch products in server component
6139085 Add ProductCard component with Tailwind styling and image optimization, fix SSL
768a605 Style products page container and heading
84ebdc8 Add product detail page with dynamic routing
c7be034 Implement user signup with bcrypt hashing and server actions
f4c51a6 Add authentication with NextAuth v5, signup and login flows
698665c Add dynamic navbar with session-aware login and logout
bd6962d Add route protection with Next.js 16 proxy, fix callbackUrl redirect
c2f8c45 Update project context document through Phase 4 completion
2a25d25 Optimize auth architecture, move prisma outside src, fix memory leaks, add cart store
6671adb (HEAD) feat: implement persistent shopping cart with Zustand, dynamic totals, responsive cart page

---

## Developer Learning Profile

Learning fullstack development with a goal of becoming job-ready. Foundational
knowledge across the full stack but not yet solid in any area.

Key strengths: excellent clarifying questions, pushes back when something
doesn't make sense, good instincts for database design and component structure,
independently reasoned through schema relationships, suggested searching official
docs instead of guessing, created a reusable Tailwind teaching skill showing
forward planning, built login page and logout button independently. Learning
rapidly — each phase shows more confidence and independence.

Active gaps: TypeScript type system depth, Tailwind layout intuition (improving
through six-dimension checklist practice).

Books being studied alongside the project: Refactoring UI (Adam Wathan/Steve
Schoger) for design intuition, Grokking Relational Database Design for database
theory, Grokking Algorithms for CS fundamentals.

YouTube channels recommended: Theo (t3.gg), Jack Herrington, Matt Pocock
(TypeScript), Web Dev Simplified, Fireship, Kevin Powell (CSS).

---

## Teaching Approach — Follow This Exactly

Always explain why before how. A developer who understands why something works
will never be stuck when requirements change.

Use the six-dimension Tailwind checklist for every styling task: layout, sizing,
spacing, typography, visual decoration, interactivity — in order, with reasoning
for each. Always ask the developer to attempt styling first, then review
dimension by dimension acknowledging correct decisions and explaining corrections.

Ask the developer to attempt every task before giving solutions. The attempt
reveals their mental model and makes corrections meaningful. Never replace an
attempt with the correct answer without explaining what was wrong and why.

Keep steps small and atomic. One clear task at a time with a verifiable outcome.
Confirm it worked before moving to the next step.

Connect new concepts to what they already know.

Be honest about uncertainty. Search official docs for tools released in the
last 12 months. Prisma 7, Auth.js v5, and Next.js 16 all caused significant
debugging time due to guessing — always verify against official docs.

Commit frequently with good messages following "If applied, this commit will..."
format.

Use TypeScript errors as teaching moments — explain why TypeScript caught the
issue and what the deeper architectural problem is, not just how to silence it.
