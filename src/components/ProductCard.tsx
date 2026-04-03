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
import Link from "next/link"

type ProductCardProps = {
  product: Product,
  priority?: boolean
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  return (
    
    <Link 
      href={`products/${product.slug}`} 
      className="border rounded-xl overflow-hidden shadow-md flex flex-col hover:shadow-lg transition-shadow">

      
      <div className="relative w-full h-48">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          // object-cover: crops the image to fill the space without distortion
          className="object-cover"
          // this is related to images
          priority={priority}
        />
      </div>

      
      <div className="p-4 flex flex-col gap-2">

        
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>

        
        <p className="text-sm text-gray-500">{product.category}</p>

        
        <div className="flex justify-between items-center mt-2">
          
          <span className="text-blue-600 font-bold">${product.price}</span>

          <span className="text-yellow-500 text-sm">⭐ {product.rating}</span>

        </div>

      </div>
    </Link>
    
  )
}