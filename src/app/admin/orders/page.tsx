import prisma from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"

const TAX_RATE = 0.14
const FALLBACK_IMAGE = "https://placehold.co/96x96/png"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
            },
          },
        },
      },
    },
  })

  const totalRevenue = orders.reduce((ordersTotal, order) => {
    const subtotal = order.orderItems.reduce(
      (itemsTotal, item) => itemsTotal + item.price * item.quantity,
      0
    )

    return ordersTotal + subtotal * (1 + TAX_RATE)
  }, 0)

  const totalItemsSold = orders.reduce(
    (ordersTotal, order) =>
      ordersTotal + order.orderItems.reduce((itemsTotal, item) => itemsTotal + item.quantity, 0),
    0
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Customer Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review purchase history with customer identity and product snapshots in one place.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:min-w-80">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Orders</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Revenue</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <h2 className="text-lg font-bold text-gray-900">No orders yet</h2>
          <p className="mt-2 text-sm text-gray-500">
            Completed checkout records will appear here once customers place orders.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-600">
              Total items sold: <span className="font-semibold text-gray-900">{totalItemsSold}</span>
            </p>
          </div>

          {orders.map((order) => {
            const itemCount = order.orderItems.reduce((total, item) => total + item.quantity, 0)
            const subtotal = order.orderItems.reduce(
              (total, item) => total + item.price * item.quantity,
              0
            )
            const tax = subtotal * TAX_RATE
            const total = subtotal + tax

            return (
              <article
                key={order.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="grid gap-4 border-b border-gray-200 bg-blue-100 p-5 lg:grid-cols-[1.2fr_1fr_auto] lg:items-center ">
                  
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Order ID
                    </p>
                    <p className="mt-1 break-all font-mono text-sm font-semibold text-gray-900">
                      {order.id}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Customer
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{order.user.name}</p>
                    <p className="text-xs text-gray-500">{order.user.email}</p>
                    <p className="mt-1 font-mono text-[11px] text-gray-400">User ID: {order.user.id}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm lg:min-w-64">
                    <div className="rounded-xl border border-gray-200 bg-white p-3">
                      <p className="text-xs font-medium text-gray-400">Items</p>
                      <p className="mt-1 font-bold text-gray-900">{itemCount}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-3">
                      <p className="text-xs font-medium text-gray-400">Total</p>
                      <p className="mt-1 font-bold text-gray-900">{formatCurrency(total)}</p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {order.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-1">
                          <Image
                            src={item.product.images[0] || FALLBACK_IMAGE}
                            alt={item.product.name}
                            fill
                            sizes="56px"
                            className="object-contain"
                          />
                        </div>

                        <div className="min-w-0">
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="block truncate text-sm font-semibold text-gray-900 hover:underline"
                          >
                            {item.product.name}
                          </Link>
                          <p className="mt-1 font-mono text-[11px] text-gray-400">
                            Product ID: {item.product.id}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-sm md:min-w-80">
                        <div>
                          <p className="text-xs font-medium text-gray-400">Qty</p>
                          <p className="font-semibold text-gray-900">{item.quantity}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-400">Price</p>
                          <p className="font-semibold text-gray-900">{formatCurrency(item.price)}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-400">Line Total</p>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2 border-t border-gray-200 bg-gray-50 p-5 text-sm sm:items-end">
                  <p className="text-gray-600">
                    Subtotal: <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
                  </p>
                  <p className="text-gray-600">
                    Tax (14%): <span className="font-semibold text-gray-900">{formatCurrency(tax)}</span>
                  </p>
                  <p className="text-base font-bold text-gray-900">
                    Amount paid: {formatCurrency(total)}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
