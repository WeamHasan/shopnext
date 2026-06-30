"use client";

import Link from "next/link";
import { loginAction } from "@/lib/actions/auth";
import { useActionState, Suspense } from "react";
import type { AuthResponse } from "@/types";
import { useSearchParams } from "next/navigation";

// 1. Move the logic that reads browser search parameters into a dedicated sub-component
function LoginForm() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") ?? "/products";

    const [state, formAction] = useActionState<AuthResponse, FormData>(loginAction, null);

    return (
        <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            
            {/* Email Field */}
            <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
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

            {/* Password Field */}
            <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
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

            {/* Error Message */}
            {state?.error && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {state.error}
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                className="bg-blue-600 text-white w-full py-3 rounded-lg font-semibold text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors mt-2 active:scale-95"
            >
                Submit
            </button>
        </form>
    );
}

// 2. The main Page component handles layout structure and wraps the client-dependent logic in Suspense
export default function Login() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white w-full max-w-md px-8 py-10 rounded-xl shadow-md">
                <h1 className="text-center text-2xl font-bold text-gray-800 mb-6">
                    Login
                </h1>

                {/* The Suspense boundary lets the production compiler know it's safe to bypass 
                  pre-rendering this specific nested form container during build time. 
                */}
                <Suspense fallback={<div className="text-center text-sm text-gray-500">Loading form...</div>}>
                    <LoginForm />
                </Suspense>

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
    );
}