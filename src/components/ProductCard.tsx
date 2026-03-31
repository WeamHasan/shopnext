/* import { Product } from "@/types";

type ProductCardProps = {
    product: Product
}

export default function ProductCard({ product } : ProductCardProps) {

    return(
        <div>
            <h3>{product.name}</h3>
            <p>{product.category}</p>
            <p>{product.price}</p>
            <p>{product.rating}</p>
            
        </div>
    )
} */


import { Product } from "@/types"
import Image from "next/image"

type ProductCardProps = {
  product: Product,
  priority?: boolean
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  return (
    // border: adds a thin border around the card
    // rounded-xl: rounds the corners significantly
    // overflow-hidden: ensures the image respects the rounded corners
    // shadow-md: adds a medium drop shadow for depth
    // flex flex-col: stacks children vertically
    // hover:shadow-lg: increases shadow on mouse hover (hover: is a Tailwind state modifier)
    // transition-shadow: animates the shadow change smoothly
    <div className="border rounded-xl overflow-hidden shadow-md flex flex-col hover:shadow-lg transition-shadow">

      {/* Product Image */}
      {/* relative: required by Next.js Image when using fill layout */}
      {/* w-full: image container takes full width of the card */}
      {/* h-48: fixes the height at 48 * 4px = 192px */}
      <div className="relative w-full h-48">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          // object-cover: crops the image to fill the space without distortion
          className="object-cover"
          priority={priority}
        />
      </div>

      {/* Card Content */}
      {/* p-4: adds 16px padding on all sides */}
      {/* gap-2: adds 8px space between each child element */}
      <div className="p-4 flex flex-col gap-2">

        {/* text-lg: slightly larger than default text */}
        {/* font-semibold: medium-heavy font weight */}
        {/* text-gray-800: dark gray, easier on the eyes than pure black */}
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>

        {/* text-sm: smaller text for secondary info */}
        {/* text-gray-500: lighter gray to create visual hierarchy */}
        <p className="text-sm text-gray-500">{product.category}</p>

        {/* flex justify-between: pushes price and rating to opposite ends */}
        {/* items-center: aligns them vertically in the middle */}
        <div className="flex justify-between items-center mt-2">

          {/* text-blue-600: blue color for the price to make it stand out */}
          {/* font-bold: strongest font weight */}
          <span className="text-blue-600 font-bold">${product.price}</span>

          {/* text-yellow-500: classic star rating color */}
          <span className="text-yellow-500 text-sm">⭐ {product.rating}</span>
        </div>

      </div>
    </div>
  )
}