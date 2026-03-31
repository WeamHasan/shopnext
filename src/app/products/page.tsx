import prisma from "@/lib/prisma"
import type { Product } from "@/types";
import ProductCard from "@/components/ProductCard";

export default async function ProductsPage() {

    const products = await prisma.product.findMany();

    return(
        <main>
            <h1>Products Page</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                    {products.map((product, index) => 
                        <ProductCard 
                        product={product} 
                        key={product.id} 
                        priority={index === 0}>    
                        </ProductCard>
                    )}
                
            </div>
        </main>
    )
}
