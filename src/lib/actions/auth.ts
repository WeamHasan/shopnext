"use server"

import prisma from "../prisma"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { signIn } from "@/lib/auth"
import { AuthError } from "next-auth"
import type { AuthResponse } from "@/types"
import { signOut } from "@/lib/auth"


export async function signupAction(prevState:AuthResponse ,formData: FormData): Promise<AuthResponse> {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
        return { error: "All fields are required"}
    }

    if (password.length < 8) {
        return { error: "Password must be at least 8 characters"}
    }

    const existingUser = await prisma.user.findUnique({
        where: {email},
    })

    if (existingUser) {
        return { error: "An account with this email already exists"}
    }

    // 12 is the salt, higher means slower but stronger.
    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.create({
        data: {
            name,
            email,
            hashedPassword,
        },
    })

    redirect("/login");
}

export async function loginAction(
  prevState: AuthResponse,
  formData: FormData
): Promise<AuthResponse> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const callbackUrl = formData.get("callbackUrl") as string | null

  if (!email || !password) {
    return { error: "Please fill in all fields" }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
  } catch (error) {
    // Auth.js v5 throws `AuthError` (CredentialsSignin subclass) when
    // authorize() returns null (wrong credentials).
    // IMPORTANT: Next.js redirect() also works by throwing internally,
    // so we must only catch AuthError and rethrow everything else,
    // otherwise a successful login's redirect gets swallowed here.
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" }
    }
    throw error
  }

  const safeCallbackUrl =
    callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/products"

  // safe: /cart
  // unsafe: https://evil.com
  // unsafe: //evil.com

  redirect(safeCallbackUrl)
}

export async function logoutAction() {
    // tells Auth.js:
    //  destroy the session
    //  redirect to /
    await signOut({ redirectTo: "/"})
}
