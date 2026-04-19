"use client"

import Image from "next/image"
import { Trash2, Minus, Plus } from "lucide-react"
import { CartItem } from "@/types"
import { useCartStore } from "@/hooks/useCartStore"
import Link from "next/link"

interface CartItemRowProps {
  item: CartItem
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem } = useCartStore()

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 py-6 border-b last:border-0">
      {/* 1. Image Sizing & Layout */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border bg-gray-50">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="96px"
          className="object-contain p-2"
        />
      </div>

      {/* 2. Product Info */}
      <div className="flex flex-1 flex-col self-start sm:self-center">
        <Link 
          href={`/products/${item.slug}`}
          className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
        >
          {item.name}
        </Link>
        <p className="mt-1 text-sm text-gray-500">${item.price.toFixed(2)}</p>
      </div>

      {/* 3. Quantity Controls (Task 9 Preview) */}
      <div className="flex items-center gap-3 bg-gray-100 rounded-full px-3 py-1">
        <button 
          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
          className="p-1 hover:text-blue-600 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <button 
          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
          className="p-1 hover:text-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* 4. Total & Remove */}
      <div className="flex flex-col items-end gap-2 sm:ml-auto">
        <p className="font-bold text-gray-900">
          ${(item.price * item.quantity).toFixed(2)}
        </p>
        <button 
          onClick={() => removeItem(item.productId)}
          className="text-red-500 hover:text-red-700 transition-colors"
          title="Remove item"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}