import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  // 1. Extend the User object to include 'role'
  interface User {
    id: string
    role: string
  }

  // 2. Extend the Session object
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"] // This keeps name, email, and image
  }
}

declare module "next-auth/jwt" {
  // 3. Extend the JWT token itself
  interface JWT {
    id: string
    role: string
  }
}