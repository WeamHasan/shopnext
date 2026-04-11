// This file wires NextAuth's request handlers into Next.js's
// routing system. The [...nextauth] folder name is a catch-all
// route that matches /api/auth/signin, /api/auth/signout,
// /api/auth/session, and any other NextAuth internal endpoints.
import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers