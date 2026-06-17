"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { CartItem } from "@/types"

export async function placeOrderAction(cartItemsJson: string) {
  try {
    // 1. Authenticate the User
    const session = await auth()
    if (!session || !session.user?.id) {
      return { success: false, error: "You must be logged in to place an order." }
    }
    const userId = session.user.id

    // 2. Parse and Validate the Input Data
    const clientItems: CartItem[] = JSON.parse(cartItemsJson)
    if (!clientItems || clientItems.length === 0) {
      return { success: false, error: "Your cart is empty." }
    }

    // 3. Multi-Step Database Transaction
    const result = await prisma.$transaction(async (tx) => {
      
      // We will build our secure order items array dynamically using DB data
      const orderItemsToCreate: {
        productId: string,
        quantity: number,
        price: number
      }[] = []

      for (const clientItem of clientItems) {

        if (clientItem.quantity <= 0 || !Number.isInteger(clientItem.quantity)){
            throw new Error("invalid quantity provided for product item.")
        }

        // Fetch the fresh product record directly from PostgreSQL
        const dbProduct = await tx.product.findUnique({
          where: { id: clientItem.productId },
          select: { stock: true, name: true, price: true } // 👈 Explicitly pull the price from DB
        })

        if (!dbProduct) {
          throw new Error(`Product ${clientItem.name} no longer exists.`)
        }

        // Inventory Stock Check
        if (dbProduct.stock < clientItem.quantity) {
          throw new Error(`Insufficient stock for ${dbProduct.name}. Only ${dbProduct.stock} left.`)
        }

        // Atomically deduct the purchased quantities from inventory stock
        await tx.product.update({
          where: { id: clientItem.productId },
          data: {
            stock: {
              decrement: clientItem.quantity
            }
          }
        })

        // Push to our validated collection using the AUTHORITATIVE DB price
        orderItemsToCreate.push({
          productId: clientItem.productId,
          quantity: clientItem.quantity,
          price: dbProduct.price, // 👈 Completely overrides client-side data!
        })
      }

      // Create the Parent Order and nested OrderItems safely using verified data
      const newOrder = await tx.order.create({
        data: {
          userId: userId,
          orderItems: {
            create: orderItemsToCreate
          }
        }
      })

      return newOrder
    })

    return { success: true, orderId: result.id }

  } catch (error: unknown) {
    console.error("ORDER_CREATION_FAILURE:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Something went wrong while processing your order." 
    }
  }
}