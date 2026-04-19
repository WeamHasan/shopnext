"use client"

import { useCartStore } from "@/hooks/useCartStore"
import { ShoppingCart } from "lucide-react"
import Link from "next/link"

export default function CartCount() {
    const items = useCartStore((state) => state.items)
    //const toggleCart = useCartStore((state) => state.toggleCart)

    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)

    return (
        <Link
            href="/cart"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors hover:bg-blue-100"
        >
            <ShoppingCart className="w-6 h-6 text-gray-700" />
            {totalItems > 0 && (
                <span
                    className="pointer-events-none absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-blue-600 px-1 text-[10px] font-bold leading-none text-white"
                >
                    {totalItems}
                </span>
            )}
        </Link>
    )
}
