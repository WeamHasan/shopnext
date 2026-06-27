import prisma from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import DeleteProductButton from "./DeleteProductButton"

export default async function AdminProductsListPage() {
  // 1. Fetch all products sorted alphabetically by name
  const products = await prisma.product.findMany({
    orderBy: {
      name: "asc",
    },
  })

  return (
    <div className="space-y-6">
      {/* Table Context Title + Global Primary Action Call */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manage Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            Update active stock, edit pricing catalogs, or add new items.
          </p>
        </div>
        <div>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-zinc-800 transition active:scale-[0.98] shadow-sm w-full sm:w-auto"
          >
            ➕ Add New Product
          </Link>
        </div>
      </div>

      {/* Dense Inventory Data Matrix Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6">Product Item</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Stock Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No products found in the active catalog. Click &quot;Add New Product&quot; to start.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/70 transition">
                    
                    {/* Column 1: Image & Name */}
                    <td className="py-4 px-6 flex items-center gap-4 min-w-70">
                      <div className="relative w-12 h-12 shrink-0 bg-gray-50 border border-gray-100 rounded-lg p-1 overflow-hidden">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="48px"
                          className="object-contain"
                        />
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-gray-900 truncate max-w-50">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5 truncate max-w-50">
                          ID: {product.id}
                        </p>
                      </div>
                    </td>

                    {/* Column 2: Category Tag */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="inline-flex items-center text-xs font-medium bg-zinc-100 text-zinc-800 px-2.5 py-1 rounded-md border border-zinc-200 uppercase tracking-wide">
                        {product.category}
                      </span>
                    </td>

                    {/* Column 3: Numeric Price */}
                    <td className="py-4 px-6 font-semibold text-gray-900 whitespace-nowrap">
                      ${product.price.toFixed(2)}
                    </td>

                    {/* Column 4: Contextual Stock Badging */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      {product.stock === 0 ? (
                        <span className="inline-flex items-center text-xs font-medium bg-red-50 text-red-700 px-2.5 py-1 rounded-full border border-red-200">
                          🛑 Out of Stock
                        </span>
                      ) : product.stock <= 5 ? (
                        <span className="inline-flex items-center text-xs font-medium bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200 animate-pulse">
                          ⚠️ Low Stock ({product.stock})
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-medium bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-200">
                          ✅ Healthy ({product.stock})
                        </span>
                      )}
                    </td>

                    {/* Column 5: Operational Modification Utilities */}
                    <td className="py-4 px-6 text-right whitespace-nowrap space-x-3">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition hover:underline"
                      >
                        Edit
                      </Link>
	                      <DeleteProductButton productId={product.id} />
	                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
