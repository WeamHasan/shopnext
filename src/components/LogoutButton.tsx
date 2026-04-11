"use client"

import { logoutAction } from "@/lib/actions/auth"

export default function LogoutButton() {
    return(
        <form action={logoutAction}>
            <button 
                type="submit"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
                Logout
            </button>
        </form>
    )
}