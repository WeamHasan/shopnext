"use server"

import prisma from "../prisma"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { signIn } from "@/lib/auth"
import { AuthError } from "next-auth"
import { AuthResponse } from "@/types"

export type SignupState = {
    error: string | null
}


export async function signupAction(prevState:SignupState ,formData: FormData): Promise<SignupState> {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
        return { error: "All field are required"}
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

  redirect("/products")
}