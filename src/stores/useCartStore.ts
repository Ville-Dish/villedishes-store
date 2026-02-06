import { shippingFee, taxRate } from "@/lib/constantData";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  cartItems: CartItem[];

  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateCartItem: (id: string, quantity: number) => void;
  clearCart: () => void;

  getSubtotal: () => number;
  getTotal: () => number;
  getTotalQuantity: () => number;
}

const TAX_RATE = taxRate / 100; // Example tax rate
const SHIPPING_FEE = shippingFee; // Example shipping fee

const useCartStore = create<CartState>()(
  persist(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (set, get) => ({
      cartItems: [],

      addToCart: (item) =>
        set((state) => {
          const existingItem = state.cartItems.find((i) => i.id === item.id);
          let updatedCart;

          if (existingItem) {
            updatedCart = state.cartItems.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            );
          } else {
            updatedCart = [...state.cartItems, { ...item, quantity: 1 }];
          }

          const newSubtotal = updatedCart.reduce(
            (sum, i) => sum + i.price * i.quantity,
            0
          );

          const newTotalQuantity = updatedCart.reduce(
            (sum, i) => sum + i.quantity,
            0
          );

          const totalWithFees =
            newSubtotal + newSubtotal * TAX_RATE + SHIPPING_FEE;

          return {
            cartItems: updatedCart,
            subtotal: newSubtotal,
            total: totalWithFees,
            totalQuantity: newTotalQuantity,
          };
        }),

      removeFromCart: (id) =>
        set((state) => {
          const updatedCart = state.cartItems.filter((item) => item.id !== id);
          const newSubtotal = updatedCart.reduce(
            (sum, i) => sum + i.price * i.quantity,
            0
          );

          const newTotalQuantity = updatedCart.reduce(
            (sum, i) => sum + i.quantity,
            0
          );

          const totalWithFees =
            newSubtotal + newSubtotal * TAX_RATE + SHIPPING_FEE;

          return {
            cartItems: updatedCart,
            subtotal: newSubtotal,
            total: totalWithFees,
            totalQuantity: newTotalQuantity,
          };
        }),

      updateCartItem: (id, quantity) =>
        set((state) => {
          const updatedCart = state.cartItems.map((item) =>
            item.id === id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
          const newSubtotal = updatedCart.reduce(
            (sum, i) => sum + i.price * i.quantity,
            0
          );

          const newTotalQuantity = updatedCart.reduce(
            (sum, i) => sum + i.quantity,
            0
          );

          const totalWithFees =
            newSubtotal + newSubtotal * TAX_RATE + SHIPPING_FEE;

          return {
            cartItems: updatedCart,
            subtotal: newSubtotal,
            total: totalWithFees,
            totalQuantity: newTotalQuantity,
          };
        }),

      clearCart: () => set({ cartItems: [] }),

      // Computed selectors
      getSubtotal: () => {
        const { cartItems } = get();
        return cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        return subtotal + subtotal * TAX_RATE + SHIPPING_FEE;
      },

      getTotalQuantity: () => {
        const { cartItems } = get();
        return cartItems.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage", // unique name for localStorage key
      partialize: (state) => ({
        cartItems: state.cartItems,
      }), // choose what to store
    }
  )
);

// Create selectors for components to use
export const useCartSubtotal = () =>
  useCartStore((state) => state.getSubtotal());
export const useCartTotal = () => useCartStore((state) => state.getTotal());
export const useCartQuantity = () =>
  useCartStore((state) => state.getTotalQuantity());
export default useCartStore;
