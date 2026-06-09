"use server"

import { auth } from "../auth"
import prisma from "../prisma"
import { CartItem } from "@/types"


export async function placeOrderAction(cartItemsJson: string) {
    try {
        //Authenticate the user
        const session = await auth();
        if (!session || !session.user?.id) {
            return {
                success: false,
                error: "You must be logged in to place an order"
            }
        }
        const userId = session.user.id;

        //Parse and validate the input
        const items: CartItem[] = JSON.parse(cartItemsJson)
        if (!items || items.length === 0) {
            return {
                success: false,
                error: "Your cart is empty"
            }
        }

        const result = await prisma.$transaction(async (tx) => {

            for (const item of items) {
                const currentProduct = await tx.product.findUnique({
                    where: {
                        id: item.productId
                    },
                    select: {
                        stock: true, name: true
                    }
                })

                if (!currentProduct) {
                    throw new Error(`Product ${item.name} no longer exists.`)
                }

                if (currentProduct.stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${currentProduct.name}. Only ${currentProduct.stock} left.`)
                }

                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity
                        }
                    },


                })

                
            }
            
            const newOrder = await tx.order.create({
                    data: {
                        userId: userId,

                        orderItems: {
                            create: items.map((item) => ({
                                productId: item.productId,
                                quantity: item.quantity,
                                price: item.price
                            }))
                        }
                    }
            })

            return newOrder
        })

        return { success: true, orderId: result?.id}

    }
    catch (error: unknown) {
        console.error("ORDER_CREATION_FAILURE: ",error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Something went wrong while processing your order"
        }
    }
}