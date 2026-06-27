"use client"

import { deleteProductAction } from "@/lib/actions/product"
import { useActionState } from "react"

interface DeleteProductButtonProps {
  productId: string
}

export default function DeleteProductButton({ productId }: DeleteProductButtonProps) {
  const deleteProductWithId = deleteProductAction.bind(null, productId)
  const [state, formAction, isPending] = useActionState(deleteProductWithId, null)

  return (
    <form action={formAction} className="inline-block">
      <button
        type="submit"
        disabled={isPending}
        className="text-sm font-medium text-red-600 hover:text-red-800 transition hover:underline bg-transparent border-none cursor-pointer disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        {isPending ? "Deleting..." : "Delete"}
      </button>

      {state?.error && (
        <p className="mt-2 max-w-72 whitespace-normal rounded-lg border border-red-200 bg-red-50 p-2 text-left text-xs font-medium text-red-700">
          {state.error}
        </p>
      )}
    </form>
  )
}
