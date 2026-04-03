import prisma from "@/lib/prisma"
import type { Product } from "@/types";
import ProductCard from "@/components/ProductCard";

export default async function ProductsPage() {

    const products:Product[] = await prisma.product.findMany();

    return(
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-center mb-8 text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">Products</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                    {products.map((product, index) => 
                        <ProductCard 
                        product={product} 
                        key={product.id}
                        // this related to images
                        priority={index === 0}>    
                        </ProductCard>
                    )}
                
            </div>
        </main>
    )
}
