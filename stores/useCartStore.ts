import { create } from "zustand";
import { persist } from "zustand/middleware";
import { shippingFee, taxRate } from "@/lib/constantData";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  cartItems: CartItem[];
  subtotal: number;
  total: number;
  totalQuantity: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateCartItem: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const TAX_RATE = taxRate / 100; // Example tax rate
const SHIPPING_FEE = shippingFee; // Example shipping fee

const useCartStore = create<CartState>()(
  persist(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (set, get) => ({
      cartItems: [],
      subtotal: 0,
      total: 0,
      totalQuantity: 0,

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

      clearCart: () =>
        set({ cartItems: [], subtotal: 0, total: 0, totalQuantity: 0 }),
    }),
    {
      name: "cart-storage", // unique name for localStorage key
      partialize: (state) => ({
        cartItems: state.cartItems,
        subtotal: state.subtotal,
        total: state.total,
        totalQuantity: state.totalQuantity,
      }), // choose what to store
    }
  )
);

export default useCartStore;
