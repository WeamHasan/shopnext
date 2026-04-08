"use server"

import prisma from "../prisma"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

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