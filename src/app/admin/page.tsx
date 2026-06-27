import prisma from "@/lib/prisma"

export default async function AdminDashboardHome() {
  // 1. Run all aggregate count queries concurrently to maximize execution speed
  const [totalUsers, totalProducts, totalOrders] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
  ])

  // 2. Fetch all order items from the DB to compute absolute historical revenue (price × quantity)
  const allOrderItems = await prisma.orderItem.findMany({
    select: { 
      price: true, 
      quantity: true 
    }
  })
  
  // Calculate raw aggregate subtotal, then apply the authoritative 14% Egyptian VAT standard
  const rawSubtotal = allOrderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)
  const totalRevenueWithTax = rawSubtotal * 1.14

  // 3. Define our metrics configuration matrix array
  const stats = [
    { 
      name: "Total Revenue", 
      value: `$${totalRevenueWithTax.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      description: "Gross income including 14% VAT", 
      icon: "💰", 
      color: "bg-green-50 text-green-700" 
    },
    { 
      name: "Customer Orders", 
      value: totalOrders.toLocaleString("en-US"), 
      description: "Total checkouts processed", 
      icon: "📜", 
      color: "bg-blue-50 text-blue-700" 
    },
    { 
      name: "Store Products", 
      value: totalProducts.toLocaleString("en-US"), 
      description: "Active inventory catalog items", 
      icon: "📦", 
      color: "bg-purple-50 text-purple-700" 
    },
    { 
      name: "Registered Users", 
      value: totalUsers.toLocaleString("en-US"), 
      description: "Total customer accounts", 
      icon: "👥", 
      color: "bg-orange-50 text-orange-700" 
    },
  ]

  return (
    <div className="space-y-8">
      {/* Page Title Context Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time store-wide operational analytics.</p>
      </div>

      {/* Responsive Metrics Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:border-gray-300 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">{stat.name}</span>
              <span className={`text-xl p-2 rounded-xl ${stat.color}`}>{stat.icon}</span>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</h3>
              <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Educational Welcoming Panel */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Welcome to the Administration Console</h2>
        <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
          Use the navigational panel links to handle system inventory metrics, restock product units, monitor real-time purchase histories, or inspect detailed buyer transactions seamlessly.
        </p>
      </div>
    </div>
  )
}