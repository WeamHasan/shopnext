"use client";

import { useCartStore } from "@/hooks/useCartStore";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import CartItemRow from "@/components/CartItemRow";

export default function CartPage() {
  const { items } = useCartStore();

  const subTotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const tax = subTotal * 0.14;

  const shipping = 0;

  const total = subTotal + tax + shipping;

  // 1. Empty State
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="bg-gray-100 p-6 rounded-full">
          <ShoppingBag className="w-12 h-12 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="text-gray-500 text-center max-w-xs">
          Looks like you haven&apos;t added anything to your cart yet.
        </p>
        <Link
          href="/products"
          className="mt-4 bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  // 2. Active State (Skeleton for now)
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-center text-3xl font-bold mb-10">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Product List Section */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItemRow key={item.productId} item={item} />
          ))}
        </div>

        {/* Summary Section Placeholder */}
        <div className="lg:col-span-1 bg-gray-50 p-6 rounded-lg h-fit border lg:sticky lg:top-24 self-start">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900">
                ${subTotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Estimated Tax (14%)</span>
              <span className="font-medium text-gray-900">
                ${tax.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-600 font-bold uppercase text-xs">
                Free
              </span>
            </div>

            {/* The Visual Divider */}
            <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between text-lg font-bold text-gray-900">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t pt-4">
            {/* <Link
                href="/checkout"
                className="w-full bg-black text-white py-4 rounded-full font-bold text-lg hover:bg-zinc-800 active:scale-95 transition-all shadow-lg shadow-gray-200">
              Proceed to Checkout
            </Link> */}

            <Link
              href="/checkout"
              className="
                block w-full mt-8 
                bg-black text-white 
                py-4 rounded-full 
                font-bold text-lg text-center
                hover:bg-zinc-800 
                transition-all 
                active:scale-[0.98] 
                shadow-lg shadow-gray-200"
            >
              Proceed to Checkout
            </Link>

            <p className="text-center text-xs text-gray-400 mt-4">
              Taxes and shipping calculated at checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
