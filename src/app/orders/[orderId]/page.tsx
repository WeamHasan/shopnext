import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

interface OrderDetailsPageProps {
  params: Promise<{
    orderId: string
  }>
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  
  const session = await auth()
  
  if (!session || !session.user?.id) {
    redirect(`/login?callbackUrl=/orders`)
  }

  const { orderId } = await params

  // 2. Fetch the order with deeply nested relations
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          product: {
            select: {
              name: true,
              slug: true,
              images: true,
            },
          },
        },
      },
    },
  })

  // 3. Guard Clause: If the order doesn't exist, trigger the native Next.js 404 page
  if (!order) {
    notFound()
  }

  if (order.userId !== session.user.id) {
    // Instead of saying "Access Denied", we return a 404 notFound().
    // This is a security best practice because it avoids confirming 
    // to a malicious actor that the resource even exists.
    notFound()
  }

  // 4. Calculate the financial totals from our snapshotted prices
  const subtotal = order.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const tax = subtotal * 0.14 // 14% VAT
  const total = subtotal + tax

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      {/* Success Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Thank You for Your Order!</h1>
        <p className="text-gray-500 mt-2">Your order has been placed successfully and is being processed.</p>
        <p className="text-xs text-gray-400 mt-1 font-mono bg-gray-100 inline-block px-2 py-1 rounded border">
          ID: {order.id}
        </p>
      </div>

      {/* Main Breakdown Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <span className="font-semibold text-gray-700">Order Summary</span>
          <span className="text-sm text-gray-500">
            {order.createdAt.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Purchased Items List */}
        <div className="divide-y divide-gray-200 px-6">
          {order.orderItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-4">
              <div className="relative h-16 w-16 shrink-0 bg-gray-50 border rounded-lg p-1">
                <Image
                  src={item.product.images[0] || "/placeholder.png"}
                  alt={item.product.name}
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-900 truncate">
                  {item.product.name}
                </h4>
                <p className="text-xs text-gray-500">
                  Qty: {item.quantity} @ ${item.price.toFixed(2)}
                </p>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Financial Calculation Summary */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 space-y-3 text-sm">
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
          <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-3 mt-1">
            <span>Amount Paid</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 text-center">
        <Link
          href="/products"
          className="inline-block bg-black text-white px-8 py-3 rounded-full font-semibold transition-all hover:bg-zinc-800 active:scale-95 shadow-md"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}