"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { PRODUCT_CATEGORIES } from "../constants"

// Define a strict type for our action return state
export type ProductFormState = {
  error?: string
  success?: boolean
} | null

// useActionState passes (prevState, formData)
export async function createProductAction(prevState: ProductFormState, formData: FormData): Promise<ProductFormState> {
  // 1. Authenticate and Authorize the Request
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized administrative access.")
  }

  // 2. Extract and Sanitize Form Inputs (Addressing Codex Medium Finding)
  const name = (formData.get("name") as string)?.trim()
  const description = (formData.get("description") as string)?.trim()
  const category = (formData.get("category") as string)?.trim()
  const priceInput = formData.get("price") as string
  const stockInput = formData.get("stock") as string
  const imageUrlInput = (formData.get("imageUrl") as string)?.trim()

  // 3. Strict Input Verification Guards
  if (!name || !description || !category || !priceInput || !stockInput) {
    return { error: "All required text fields must be filled out." }
  }

  // Validate Category enum boundary safety
  const allowedCategories = PRODUCT_CATEGORIES.map((cat) => cat.id as string)
  if (!allowedCategories.includes(category)) {
    return { error: "Invalid catalog category selected." }
  }

  const price = parseFloat(priceInput)
  const stock = parseInt(stockInput, 10)

  if (isNaN(price) || price <= 0) {
    return { error: "Price must be a valid positive number." }
  }

  if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
    return { error: "Stock metrics must be absolute integers." }
  }

  // Generate and verify slug
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")

  if (!slug) {
    return { error: "Failed to generate a unique routing identifier from the product name." }
  }

  const images = imageUrlInput ? [imageUrlInput] : ["https://placehold.co/600x400/png"]

  try {
    // 4. Database Mutation
    await prisma.product.create({
      data: { name, slug, description, category, price, stock, images },
    })
  } catch (error: unknown) {
    console.error("PRODUCT_CREATION_DATABASE_ERROR:", error)
    return { error: "A product with a similar name identifier already exists." }
  }

  // 5. Purge Next.js Cache Layers
  revalidatePath("/admin/products")
  revalidatePath("/products")
  
  // 6. Direct User Back
  redirect("/admin/products")
}

export async function updateProductAction(
  id: string,
  prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  // 1. Authenticate and Authorize the Request
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized administrative access.")
  }

  // 2. Extract and Sanitize Inputs
  const name = (formData.get("name") as string)?.trim()
  const description = (formData.get("description") as string)?.trim()
  const category = (formData.get("category") as string)?.trim()
  const priceInput = formData.get("price") as string
  const stockInput = formData.get("stock") as string
  const imageUrlInput = (formData.get("imageUrl") as string)?.trim()

  // 3. Validation Guards
  if (!name || !description || !category || !priceInput || !stockInput) {
    return { error: "All required fields must be filled out." }
  }

  const allowedCategories = PRODUCT_CATEGORIES.map((cat) => cat.id as string)
  if (!allowedCategories.includes(category)) {
    return { error: "Invalid catalog category selected." }
  }

  const price = parseFloat(priceInput)
  const stock = parseInt(stockInput, 10)

  if (isNaN(price) || price <= 0) {
    return { error: "Price must be a valid positive number." }
  }

  if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
    return { error: "Stock metrics must be absolute integers." }
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")

  const images = imageUrlInput ? [imageUrlInput] : ["https://placehold.co/600x400/png"]

  try {
    // 4. Update the record in PostgreSQL
    await prisma.product.update({
      where: { id },
      data: { name, slug, description, category, price, stock, images },
    })
  } catch (error: unknown) {
    console.error("PRODUCT_UPDATE_DATABASE_ERROR:", error)
    return { error: "Failed to update record. Another item might already use this generated slug name." }
  }

  // 5. Revalidate cache boundaries
  revalidatePath("/admin/products")
  revalidatePath("/products")
  revalidatePath(`/products/${slug}`)

  // 6. Redirect back to database table listing panel
  redirect("/admin/products")
}

export async function deleteProductAction(
  id: string,
  _prevState: ProductFormState,
  _formData: FormData
): Promise<ProductFormState> {
  void _prevState
  void _formData

  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized administrative access")
  }

  try {

    const connectedOrdersCount = await prisma.orderItem.count({
      where: { productId: id },
    })

    if (connectedOrdersCount > 0) {
      return {
        error: "This product cannot be deleted because it is linked to existing customer orders. Set its stock volume to 0 instead to hide it from shoppers."
      }
    }

    await prisma.product.delete({
      where: {id},
    })
    
  } catch (error: unknown) {
    console.error("PRODUCT_DELETION_DATABASE_ERROR:", error)
    return { error: "An unexpected system error occurred while trying to purge this product record."}
  }

  revalidatePath("/admin/products")
  revalidatePath("/products")

  return { success: true }
}
