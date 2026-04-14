import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Product } from "@/types";
import Image from "next/image";
import AddToCartButton from "@/components/AddToCartButton";

type ProductPageProps = {
    params: Promise<{
        slug: string
    }>
}

export default async function ProductPage({ params } : ProductPageProps) {

    const { slug } = await params;

    const product : Product | null = await prisma.product.findUnique({
        where: { slug }
    })

    if (product === null) return notFound();

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative w-full h-96">
                <Image
                src={product.images[0]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover rounded-xl"
                priority
                />
            </div>

            <div className="flex flex-col gap-4 bg-gray-50 rounded-xl p-6">
                <p className="text-sm text-gray-500 uppercase tracking-wide">{product.category}</p>
                <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
                <p className="text-blue-600 text-2xl font-bold">${product.price}</p>
                <p className="text-yellow-500 text-sm">⭐ {product.rating}</p>
                <p className={product.stock > 0 ? "text-green-600 text-sm" : "text-red-500 text-sm"}>
                    {product.stock > 0 ? `${product.stock} in stock` : "out of stock"}
                </p>
                <AddToCartButton product={product} />
            </div>
        </main>
    )
}