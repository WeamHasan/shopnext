import prisma from "@/lib/prisma"

export default async function ProductsPage() {

    const products = await prisma.product.findMany();

    return(
        <main>
            <h1>Products Page</h1>
            <div>
                <ul>
                    {products.map(
                        product => 
                        <li key={product.id}>product: {product.name}, price: {product.price}</li>
                    )}
                </ul>
            </div>
        </main>
    )
}
