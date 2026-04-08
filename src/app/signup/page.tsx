"use client";
import { useActionState } from "react";
import { signupAction, SignupState } from "@/lib/actions/auth";
import Link from "next/link";

const initialState: SignupState = { error: null};

export default function Signup() {

    const [state, fromAction] = useActionState(signupAction, initialState)
  return (
    // min-h-screen centers the form vertically on the page
    // flex items-center justify-center achieves that centering
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-xl shadow-md px-8 py-10 w-full max-w-md">
        {/* Form header */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Create an account
        </h1>

        {/* No action yet - we'll add the server action next */}
        <form action={fromAction} className="flex flex-col gap-4">
          {/* Each label-input pair is wrapped in its own div */}
          {/* This groups them visually and semantically */}
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Your full name"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

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
              placeholder="you@example.com"
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
              placeholder="At least 8 characters"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {state.error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors mt-2 active:scale-95"
          >
            Sign Up
          </button>
        </form>

        {/* Link to login page for users who already have an account */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
