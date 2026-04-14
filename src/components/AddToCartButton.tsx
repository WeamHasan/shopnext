"use client";

import { useState } from "react";
import { Product, CartItem } from "@/types";
import { useCartStore } from "@/hooks/useCartStore";

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    const item: CartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      slug: product.slug,
      quantity: 1,
    };

    addItem(item);
    setIsAdded(true);

    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <button
      className={` ${
        isAdded
          ? "bg-green-600 hover:bg-green-700"
          : "bg-blue-600 hover:bg-blue-700"
      } 
      disabled:bg-gray-400 disabled:cursor-not-allowed
      text-white w-full px-6 py-3 font-semibold rounded-full transition-colors mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:scale-95`}
      onClick={handleAddToCart}
      disabled={product.stock < 1}
    >
      {product.stock < 1 ? "Out of Stock" 
      : isAdded ? "✓ Added!" 
      : "Add to Cart"}
    </button>
  );
}
