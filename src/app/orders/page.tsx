import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function OrderHistoryPage() {
  // 1. Fetch the server session
  const session = await auth()
  
  // Guard Clause: If the user bypassed the proxy somehow, redirect them to login
  if (!session || !session.user?.id) {
    redirect("/login?callbackUrl=/orders")
  }

  const userId = session.user.id

  // 2. Fetch all orders matching this user ID, newest first
  const orders = await prisma.order.findMany({
    where: { userId: userId },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      orderItems: true // Include items to calculate total amount and item count per order
    }
  })

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Your Orders</h1>
      <p className="text-gray-500 mb-8">Manage and review your recent store purchases.</p>

      {/* Fallback Case: User has never placed an order */}
      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white border rounded-2xl border-gray-200">
          <p className="text-gray-500 mb-4">You have not placed any orders yet.</p>
          <Link
            href="/products"
            className="inline-block bg-black text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-zinc-800 transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        /* Orders List Dashboard Table/Cards */
        <div className="space-y-4">
          {orders.map((order) => {
            // Calculate totals dynamically from snapshotted prices inside each order's items array
            const itemCount = order.orderItems.reduce((acc, item) => acc + item.quantity, 0)
            const subtotal = order.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
            const totalAmount = subtotal * 1.14 // Including 14% VAT

            return (
              <div 
                key={order.id} 
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:border-gray-300 transition"
              >
                {/* Left Side: Order Meta Meta Details */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm font-mono text-gray-900 bg-gray-100 px-2 py-0.5 rounded border">
                      #{order.id.slice(0, 8)}...
                    </span>
                    <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                      Success
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Placed on: {" "}
                    {order.createdAt.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {/* Center Side: Summary Metrics */}
                <div className="flex gap-8 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs uppercase font-medium tracking-wider">Items</p>
                    <p className="font-semibold mt-0.5 text-gray-800">{itemCount} items</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase font-medium tracking-wider">Total Paid</p>
                    <p className="font-bold mt-0.5 text-gray-900">${totalAmount.toFixed(2)}</p>
                  </div>
                </div>

                {/* Right Side: Navigation Anchor */}
                <div>
                  <Link
                    href={`/orders/${order.id}`}
                    className="inline-block w-full md:w-auto text-center border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition active:scale-[0.98]"
                  >
                    View Invoice
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}