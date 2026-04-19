import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { CartItem } from "@/types"


// We define the shape of the entire store as a TypeScript type.
// It contains both the state (items) and the functions that modify it.
// Keeping them in the same type is the Zustand convention — state and
// actions live together, unlike Redux which separates them.
type CartStore = {
  items: CartItem[]
  isOpen: boolean //new state
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  // new actions
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

export const useCartStore = create<CartStore>()(
  // persist wraps our store definition and automatically saves the state
  // to localStorage whenever it changes, and rehydrates it on page load.
  // This is what makes the cart survive page refreshes.
  persist(
    // The (set) callback is where we define our state and actions.
    // "set" is Zustand's function for updating state — you call it with
    // either a new partial state object or a function that receives the
    // current state and returns a new partial state.
    (set) => ({
      // Initial state — cart starts empty
      items: [],
      isOpen: false,

      addItem: (newItem) =>
        set((state) => {
          // Check if this product is already in the cart
          const existingItem = state.items.find(
            (item) => item.productId === newItem.productId
          )

          if (existingItem) {
            // Product already in cart — increment quantity.
            // We use .map() to return a new array (never mutate state directly
            // in React — always return new objects/arrays).
            return {
              items: state.items.map((item) =>
                item.productId === newItem.productId
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            }
          }

          // Product not in cart yet — add it as a new entry.
          // The spread [...state.items, newItem] creates a new array
          // containing all existing items plus the new one.
          return { items: [...state.items, newItem] }
        }),

      removeItem: (productId) =>
        set((state) => ({
          // .filter() returns a new array containing only items that
          // do NOT match the productId being removed.
          items: state.items.filter((item) => item.productId !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          // If quantity drops to 0 or below, remove the item entirely.
          // This lets the cart page use a single function for both
          // "decrease quantity" and "remove item" behaviors.
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.productId !== productId),
            }
          }

          return {
            items: state.items.map((item) =>
              item.productId === productId ? { ...item, quantity } : item
            ),
          }
        }),

      // clearCart replaces the entire items array with an empty array.
      // Called after a successful checkout.
      clearCart: () => set({ items: [] }),

      openCart: () => set( {isOpen: true}),
      closeCart: () => set( {isOpen: false}),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen}) )
    }),
    {
      // The key under which the cart is saved in localStorage.
      // Choose something specific to your app to avoid collisions
      // if multiple apps run on the same domain (e.g. localhost).
      name: "shopnext-cart",

      // createJSONStorage tells Zustand to use localStorage and
      // handle the JSON serialization/deserialization automatically.
      // We pass a function () => localStorage rather than localStorage
      // directly because during server-side rendering localStorage
      // doesn't exist — the function delays access until the browser runs it.
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({ items: state.items})
    }
  )
)