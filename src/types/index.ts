// This file is the single source of truth for all data types in our app.
// Components, pages, and utilities all import from here — never from Prisma directly.
// This keeps our UI layer completely independent of our database layer.

export type Product = {
  id: string
  name: string
  slug: string
  price: number
  description: string
  images: string[]
  stock: number
  category: string
  rating: number
  createdAt: Date
}

export type AuthResponse = {
  error?: string;
  success?: boolean;
} | null; // Adding null here allows the initial state to be empty