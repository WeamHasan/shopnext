import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

// PrismaPg is the driver adapter that connects Prisma to PostgreSQL
// It takes your connection string and handles the actual TCP connection
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

// Now PrismaClient receives the adapter instead of managing
// the connection itself - this is the Prisma 7 way
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.product.deleteMany()

  await prisma.product.createMany({
    data: [
      {
        name: "Wireless Headphones",
        slug: "wireless-headphones",
        price: 99.99,
        description: "High quality wireless headphones with noise cancellation.",
        images: ["https://placehold.co/600x400?text=Headphones"],
        stock: 50,
        category: "Electronics",
        rating: 4.5,
      },
      {
        name: "Running Shoes",
        slug: "running-shoes",
        price: 79.99,
        description: "Lightweight and comfortable running shoes for all terrains.",
        images: ["https://placehold.co/600x400?text=Shoes"],
        stock: 30,
        category: "Sports",
        rating: 4.2,
      },
      {
        name: "Coffee Maker",
        slug: "coffee-maker",
        price: 49.99,
        description: "Brew the perfect cup of coffee every morning.",
        images: ["https://placehold.co/600x400?text=Coffee+Maker"],
        stock: 20,
        category: "Kitchen",
        rating: 4.7,
      },
      {
        name: "Yoga Mat",
        slug: "yoga-mat",
        price: 29.99,
        description: "Non-slip yoga mat with carrying strap.",
        images: ["https://placehold.co/600x400?text=Yoga+Mat"],
        stock: 100,
        category: "Sports",
        rating: 4.0,
      },
      {
        name: "Mechanical Keyboard",
        slug: "mechanical-keyboard",
        price: 129.99,
        description: "Tactile mechanical keyboard with RGB backlight.",
        images: ["https://placehold.co/600x400?text=Keyboard"],
        stock: 15,
        category: "Electronics",
        rating: 4.8,
      },
    ],
  })

  console.log("✅ Database seeded successfully")
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })