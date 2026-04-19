import Link from "next/link"
import { auth } from "@/lib/auth"
import LogoutButton from "./LogoutButton"
import CartCount from "./CartCount";

export default async function Navbar() {
  const session = await auth();
  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* LEFT — Brand + Navigation links */}
        {/* flex items-center gap-6: links sit side by side with spacing */}
        <section className="flex items-center gap-6">

          {/* Brand logo/name — font-bold text-xl makes it stand out */}
          <Link href="/" className="font-bold text-xl text-blue-600">
            ShopNext
          </Link>

          <Link href="/" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
            Home
          </Link>

          <Link href="/products" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
            Products
          </Link>

        </section>

        <section className="flex-1 max-w-md mx-auto">

          {/* relative: needed to position a search icon inside later */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </section>

        {/* RIGHT — Cart and Auth */}
        {/* gap-4: space between cart and login links */}
        <section className="flex items-center gap-4">
          
            <CartCount />
          

          {session?.user ? (
            <div className="flex items-center gap-3">
              {/* Greet the user by their first name only — split(" ")[0]
                  takes the first word of their full name */}
              <span className="text-sm text-gray-700 font-medium">
                Hi, {session.user.name?.split(" ")[0]}
              </span>
              <LogoutButton />
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
            >
              Login
            </Link>
          )}
        </section>

      </div>
    </nav>
  )
}