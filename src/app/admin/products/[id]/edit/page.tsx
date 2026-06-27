import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import EditProductForm from "./EditProductForm"

interface EditProductPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params

  // Fetch the current record directly from PostgreSQL on the server
  const product = await prisma.product.findUnique({
    where: { id },
  })

  // Guard clause: If an admin passes a non-existent ID parameter string, throw a 404
  if (!product) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="text-sm font-semibold text-gray-500 hover:text-black transition inline-flex items-center gap-1 mb-2"
        >
          ⬅️ Back to Products Table
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Edit Product</h1>
        <p className="text-sm text-gray-500 mt-1">
          Modify active descriptions, update stock volume scales, or shift price points for item ID: <span className="font-mono text-xs bg-gray-100 border px-1.5 py-0.5 rounded text-gray-600">{product.id}</span>
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        {/* Mount our interactive form component streaming our data values down */}
        <EditProductForm product={product} />
      </div>
    </div>
  )
}