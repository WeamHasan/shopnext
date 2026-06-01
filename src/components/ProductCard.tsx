import type { Product } from "@/types"
import Image from "next/image"
import Link from "next/link"


type ProductCardProps = {
  product: Product,
  priority?: boolean
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  return (
    
    <Link 
      href={`/products/${product.slug}`} 

      //NOTE:
      //overflow-hidden: clips image corners inside rounded card

      className="border rounded-xl overflow-hidden shadow-md flex flex-col hover:shadow-lg transition-shadow">

      {/* 
      //NOTE: 
      // Next.js <Image fill /> needs a parent (div) with: 
      - a set size
      - position: relative  
      */}
      <div className="relative w-full h-48">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill //this is why we use a div wrapping the Image
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
          
          <span className="text-blue-600 font-bold">${product.price.toFixed(2)}</span>

          {/* 
          you can use import { Star } from "lucide-react" instead of star emoji
          */}
          <span className="text-yellow-500 text-sm">⭐ {product.rating}
          </span>

        </div>

      </div>
    </Link>
    
  )
}