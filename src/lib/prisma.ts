import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

// This function creates a brand new PrismaClient instance
// We extract it into a function so we can call it in two places
// without duplicating the adapter setup code
const createPrismaClient = () => {
  // Prisma 7 requires a driver adapter - this is the PostgreSQL one
  // It reads your DATABASE_URL from environment variables automatically
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  })

  return new PrismaClient({ adapter })
}

// We extend the Node.js global type to include our prisma property
// This is TypeScript's way of saying "trust me, this property exists on global"
declare global {
  var prisma: ReturnType<typeof createPrismaClient> | undefined
}

// The singleton pattern:
// If a prisma instance already exists on the global object, reuse it
// If not, create a fresh one
// This prevents hundreds of connections during Next.js hot reloads
const prisma = globalThis.prisma ?? createPrismaClient()

// Only store on global in development - in production the server
// never hot reloads so we don't need this trick
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma
}

export default prisma