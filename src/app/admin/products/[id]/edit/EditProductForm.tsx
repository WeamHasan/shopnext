"use client"

import { updateProductAction } from "@/lib/actions/product"
import { useActionState } from "react"
import Link from "next/link"
import { PRODUCT_CATEGORIES } from "@/lib/constants"

// Explicit type layout mapping our inbound Prisma product data structure
interface EditProductFormProps {
  product: {
    id: string
    name: string
    description: string
    category: string
    price: number
    stock: number
    images: string[]
  }
}



export default function EditProductForm({ product }: EditProductFormProps) {
  // Pre-bind the product ID as the first argument to our action function
  const updateProductWithId = updateProductAction.bind(null, product.id)
  
  const [state, formAction, isPending] = useActionState(updateProductWithId, null)

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl">
          ⚠️ {state.error}
        </div>
      )}

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
          defaultValue={product.name}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black transition disabled:bg-gray-50"
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
          defaultValue={product.category}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black transition disabled:bg-gray-50"
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
            defaultValue={product.price}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black transition disabled:bg-gray-50"
          />
        </div>

        <div>
          <label htmlFor="stock" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Current Stock Volume *
          </label>
          <input
            type="number"
            id="stock"
            name="stock"
            step="1"
            min="0"
            required
            disabled={isPending}
            defaultValue={product.stock}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black transition disabled:bg-gray-50"
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
          defaultValue={product.images[0] || ""}
          placeholder="https://placehold.co/600x400/png"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black transition font-mono disabled:bg-gray-50"
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
          defaultValue={product.description}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black transition resize-y disabled:bg-gray-50"
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
          className="px-5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-zinc-800 transition active:scale-95 shadow-sm disabled:bg-zinc-400"
        >
          {isPending ? "Updating..." : "Update Product Changes"}
        </button>
      </div>
    </form>
  )
}