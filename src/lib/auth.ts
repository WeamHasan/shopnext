import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  // The session strategy determines how NextAuth stores session data.
  // "jwt" means the session is stored in a signed JSON Web Token
  // in a cookie — no database table needed for sessions.
  // The alternative is "database" which stores sessions in a
  // sessions table, but JWT is simpler and works well for our needs.
  session: { strategy: "jwt" },

  // providers is an array of authentication methods you support.
  // We only support credentials (email + password) for now.
  // You could add Google, GitHub etc. here later with one line each.
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // The authorize function is where YOUR validation logic lives.
      // NextAuth calls this function whenever someone tries to log in.
      // It receives the credentials from the login form and must return
      // either a user object (success) or null (failure).
      async authorize(credentials) {
        const email = credentials?.email as string
        const password = credentials?.password as string

        // Step 1 — validate that both fields were provided
        if (!email || !password) return null

        // Step 2 — find the user by email only, never by password
        const user = await prisma.user.findUnique({
          where: { email },
        })

        // Step 3 — if no user found, return null immediately.
        // We return the same null as a wrong password to prevent
        // user enumeration — attackers shouldn't know which step failed.
        if (!user) return null

        // Step 4 — compare the submitted password against the stored hash.
        // bcrypt.compare() handles the salt internally — it extracts the
        // salt that was embedded in the hash when the account was created,
        // applies it to the submitted password, and checks if the results match.
        const passwordMatch = await bcrypt.compare(password, user.hashedPassword)

        if (!passwordMatch) return null

        // Step 5 — return the user object. NextAuth will embed this
        // information into the JWT token. Only include what you need
        // in the token — never include hashedPassword.
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],

  // Callbacks let you customize what gets stored in the token and session.
  // Without these, the role and id fields we return from authorize()
  // would be lost — NextAuth only keeps name, email, and image by default.
  callbacks: {
    // The jwt callback runs when the token is created or updated.
    // We add role and id to the token so they're available later.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },

    // The session callback runs when a component calls auth() to get
    // the current session. We copy id and role from the token into
    // the session object so components can access them.
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },

  // Custom pages tell NextAuth to use your own login page instead
  // of its default built-in UI. This must match your actual route.
  pages: {
    signIn: "/login",
  },
})