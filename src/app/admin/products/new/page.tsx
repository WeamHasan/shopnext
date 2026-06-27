"use client" // 👈 Enabled to handle action states and error alerts

import { createProductAction } from "@/lib/actions/product"
import { useActionState } from "react"
import Link from "next/link"
import { PRODUCT_CATEGORIES } from "@/lib/constants"

export default function NewProductFormPage() {
  // Hook wire-up: returns [current_state, form_action_trigger, is_pending]
  const [state, formAction, isPending] = useActionState(createProductAction, null)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <div>
        <Link
          href="/admin/products"
          className="text-sm font-semibold text-gray-500 hover:text-black transition inline-flex items-center gap-1 mb-2"
        >
          ⬅️ Back to Products Table
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Add New Product</h1>
        <p className="text-sm text-gray-500 mt-1">
          Input catalog definitions to introduce a new stock item to the storefront database.
        </p>
      </div>

      {/* Dynamic Error Banner Rendering */}
      {state?.error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl animate-shake">
          ⚠️ {state.error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <form action={formAction} className="space-y-5">
          
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              disabled={isPending}
              placeholder="e.g. Mechanical Gaming Keyboard"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition disabled:bg-gray-50"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Inventory Category *
            </label>
            <select
              id="category"
              name="category"
              required
              disabled={isPending}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition disabled:bg-gray-50"
            >
              <option value="">-- Choose Category --</option>
              
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}

            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Unit Price ($ USD) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                step="0.01"
                min="0.01"
                required
                disabled={isPending}
                placeholder="0.00"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition disabled:bg-gray-50"
              />
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Initial Stock Volume *
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                step="1"
                min="0"
                required
                disabled={isPending}
                placeholder="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition disabled:bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Product Image Asset URL
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              disabled={isPending}
              placeholder="https://placehold.co/600x400/png"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition font-mono disabled:bg-gray-50"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Marketing & Specification Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              disabled={isPending}
              placeholder="Provide a thorough, comprehensive overview outlining product features..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition resize-y disabled:bg-gray-50"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <Link
              href="/admin/products"
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold hover:bg-gray-50 text-gray-700 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-zinc-800 transition active:scale-95 shadow-sm disabled:bg-zinc-400 flex items-center gap-2"
            >
              {isPending ? "Saving..." : "Save Product Record"}
            </button>
          </div>

        </form>
      </div>

    </div>
  )
}