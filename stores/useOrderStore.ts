import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define interfaces for the structure of products, shipping info, and order details.
interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  postalCode: string;
  orderNotes?: string;
}

// Update OrderDetails to include order number and order date.
interface OrderDetails {
  id: string;
  products: Product[];
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
  shippingInfo: ShippingInfo;
  referenceNumber?: string;
  paymentDate?: string;
  verificationCode?: string;
  orderNumber?: string; // Added order number
  orderDate?: string; // Added order date
  status: "UNVERIFIED" | "PENDING" | "CANCELLED" | "FULFILLED" | undefined;
}

interface OrderState {
  orders: OrderDetails[];
  addOrder: (order: OrderDetails) => Promise<OrderDetails | null>;
  updateOrder: (
    orderId: string,
    updates: Partial<OrderDetails>
  ) => Promise<OrderDetails | null>;
  clearOrder: () => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (set, get) => ({
      orders: [],

      // Add an order to the state
      addOrder: (order) => {
        return new Promise<OrderDetails | null>((resolve) => {
          set((state) => {
            const orderKeys = Object.keys(order);
            if (orderKeys.length === 0) {
              resolve(null);
              return state;
            }
            const newOrder = { ...order };
            newOrder.status = "UNVERIFIED";
            state.orders.push(newOrder);
            resolve(newOrder);
            return { orders: state.orders };
          });
        });
      },

      // Update the reference number and payment date for pending order (without order number and order date)
      updateOrder: (orderId, updates) => {
        return new Promise<OrderDetails | null>((resolve) => {
          set((state) => {
            const orderIndex = state.orders.findIndex(
              (order) => order.id === orderId
            );
            if (orderIndex === -1) {
              resolve(null);
              return state;
            }

            const updatedOrder = { ...state.orders[orderIndex], ...updates };
            const newOrders = [...state.orders];
            newOrders[orderIndex] = updatedOrder;

            resolve(updatedOrder);
            return { orders: newOrders };
          });
        });
      },

      clearOrder: () => set({ orders: [] }),
    }),
    {
      name: "order-storage", // unique name for localStorage key
      partialize: (state) => ({ orders: state.orders }),
    }
  )
);

export default useOrderStore;
