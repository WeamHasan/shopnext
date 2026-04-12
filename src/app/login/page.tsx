"use client";

import Link from "next/link";
import { loginAction } from "@/lib/actions/auth";
import { useActionState } from "react"
import { AuthResponse } from "@/types";
import { useSearchParams } from "next/navigation";


export default function Login() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") ?? "/products";

    const [state, formAction] = useActionState<AuthResponse, FormData>(loginAction, null);
    

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white w-full max-w-md px-8 py-10 rounded-xl shadow-md">
                <h1 className="text-center text-2xl font-bold text-gray-800 mb-6">
                    Login
                </h1>
                <form action={formAction} className="flex flex-col gap-4">
                    <input type="hidden" name="callbackUrl" value={callbackUrl} />
                    <div className="flex flex-col gap-1">
                        <label
                            htmlFor="email"
                            className="text-sm font-medium text-gray-700"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="your email"
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label
                            htmlFor="password"
                            className="text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="your password"
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>
                    {state?.error && (
                        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            {state.error}
                        </div>
                    )}
                    <button
                        type="submit"
                        className="bg-blue-600 text-white w-full py-3 rounded-lg font-semibold text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors mt-2 active:scale-95"
                    >
                        Submit
                    </button>
                </form>
                <p className="text-center text-sm text-gray-500 mt-6">
                    You do not have an account?{" "}
                    <Link
                        href="/signup"
                        className="text-blue-600 hover:underline font-medium"
                    >
                        Signup
                    </Link>
                </p>
            </div>
        </main>
    )
}
