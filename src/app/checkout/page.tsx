"use client"

import { useState } from "react"
import { useCartStore } from "@/hooks/useCartStore"
import { placeOrderAction } from "@/lib/actions/order"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore()
  const router = useRouter()
  
  // Local state to handle button loading animations and error messages
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Calculate financial derived states
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const tax = subtotal * 0.14 // 14% VAT
  const total = subtotal + tax

  // Guard clause: If the cart is empty, show a fallback message
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-xl font-semibold">Your cart is empty</h2>
        <p className="text-gray-500">You cannot checkout without items in your cart.</p>
        <Link href="/products" className="text-blue-600 hover:underline">
          Return to products
        </Link>
      </div>
    )
  }

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      // Serialize the client-side Zustand items array into a raw JSON string
      const cartItemsJson = JSON.stringify(items)
      
      // Fire the Server Action securely across the network boundary
      const result = await placeOrderAction(cartItemsJson)

      if (!result.success) {
        setErrorMessage(result.error || "An error occurred.")
        setIsSubmitting(false)

        //move top to see the error message
        window.scrollTo({ top: 0, behavior: 'smooth' })

        return
      }

      clearCart()

      // If successful, redirect the user to the temporary confirmation route
      // (We will handle clearing the Zustand store on success in Task 6!)
      router.push(`/orders/${result.orderId}`)
      
    } catch (err) {
      setErrorMessage("A critical network error occurred. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: Shipping Details Form (7 Columns) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-xl font-bold mb-6">Shipping Information</h2>
          
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
              ⚠️ {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                required 
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
              <input 
                type="text" 
                required 
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="123 Main Street, Cairo"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input 
                  type="text" 
                  required 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Cairo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  required 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="+20 123 456 7890"
                />
              </div>
            </div>

            {/* The Black Complete Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 bg-black text-white py-4 rounded-full font-bold text-lg hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-lg shadow-gray-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Processing Your Order..." : "Place Order"}
            </button>
          </form>
        </div>

        {/* RIGHT: Order Review Panel (5 Columns) */}
        <div className="lg:col-span-5 bg-gray-50 p-6 rounded-xl border border-gray-200 lg:sticky lg:top-24">
          <h2 className="text-xl font-bold mb-4">Your Order</h2>
          
          <div className="divide-y divide-gray-200 max-h-[40vh] overflow-y-auto pr-2 mb-6">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-4 py-3">
                <div className="relative h-12 w-12 shrink-0 bg-white border rounded p-1">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="48px"
                    className="object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-gray-900 truncate">{item.name}</h4>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-3 text-sm border-t border-gray-200 pt-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (14%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="text-green-600 font-medium">FREE</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-3 mt-2">
              <span>Total Amount</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

