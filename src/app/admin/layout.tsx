import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"
import Link from "next/link"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth()

  if (!session || session.user?.role !== "ADMIN") {
    notFound()
  }

  return (
    <div className="flex min-h-screen bg-gray-50 pb-16 md:pb-0"> {/* Added pb-16 to avoid bottom nav overlapping content on mobile */}
      
      {/* DESKTOP SIDEBAR: Hidden on mobile, visible on desktop (md:block) */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 bg-zinc-900 text-white">
          <Link href="/admin" className="font-bold text-lg tracking-wide">
            ShopNext Admin
          </Link>
        </div>
        
        <nav className="p-4 space-y-1">
          <Link href="/admin" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-100 hover:text-black transition">
            📊 Dashboard Overview
          </Link>
          <Link href="/admin/products" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-100 hover:text-black transition">
            📦 Manage Products
          </Link>
          <Link href="/admin/orders" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-100 hover:text-black transition">
            📜 Customer Orders
          </Link>
          <hr className="my-4 border-gray-200" />
          <Link href="/products" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-500 hover:bg-gray-100 hover:text-black transition">
            ⬅️ Public Store
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT CANVAS */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <Link href="/admin" className="font-bold text-gray-900 md:hidden">
            ShopNext Admin 👑
          </Link>
          <div className="flex items-center gap-2 ml-auto">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-semibold text-gray-700 hidden sm:inline">
              Admin: {session.user?.name}
            </span>
          </div>
        </header>

        {/* Dynamic Inner Layout Body */}
        <div className="p-4 md:p-8 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR: Visible only on mobile screens (md:hidden) */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 shadow-lg flex items-center justify-around px-2 z-50 md:hidden">
        <Link href="/admin" className="flex flex-col items-center justify-center w-16 h-full text-gray-600 active:text-black">
          <span className="text-xl">📊</span>
          <span className="text-[10px] font-medium mt-0.5">Stats</span>
        </Link>
        <Link href="/admin/products" className="flex flex-col items-center justify-center w-16 h-full text-gray-600 active:text-black">
          <span className="text-xl">📦</span>
          <span className="text-[10px] font-medium mt-0.5">Products</span>
        </Link>
        <Link href="/admin/orders" className="flex flex-col items-center justify-center w-16 h-full text-gray-600 active:text-black">
          <span className="text-xl">📜</span>
          <span className="text-[10px] font-medium mt-0.5">Orders</span>
        </Link>
        <Link href="/products" className="flex flex-col items-center justify-center w-16 h-full text-gray-500 active:text-black">
          <span className="text-xl">⬅️</span>
          <span className="text-[10px] font-medium mt-0.5">Exit</span>
        </Link>
      </nav>

    </div>
  )
}