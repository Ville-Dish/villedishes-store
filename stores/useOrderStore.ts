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
  id: number;
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
  status: "pending" | "verified" | "cancelled" | undefined;
}

interface OrderState {
  orders: OrderDetails[];
  addOrder: (order: OrderDetails) => Promise<OrderDetails | null>;
  updateOrder: (
    orderId: number,
    updates: Partial<OrderDetails>
  ) => Promise<OrderDetails | null>;
  verifyOrder: (
    orderId: number,
    providedVerificationCode: string
  ) => Promise<OrderDetails | null>;
  cancelOrder: (orderId: number) => void;
  getOrderById: (orderId: number) => OrderDetails | undefined;
  getPendingOrders: () => OrderDetails[];
  getVerifiedOrders: () => OrderDetails[];
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
            newOrder.status = "pending";
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

      // Verify the pending order and add order number and order date
      verifyOrder: (orderId, providedVerificationCode) => {
        return new Promise<OrderDetails | null>((resolve) => {
          set((state) => {
            const orderIndex = state.orders.findIndex(
              (order) => order.id === orderId
            );
            if (orderIndex === -1) {
              resolve(null);
              return state;
            }

            const order = state.orders[orderIndex];
            if (order.verificationCode !== providedVerificationCode) {
              resolve(null);
              return state;
            }

            const verifiedOrder = {
              ...order,
              status: "verified" as const,
              orderNumber: `ORD-${Math.floor(Math.random() * 1000000)}`,
              orderDate: new Date().toISOString().split("T")[0],
            };

            const newOrders = [...state.orders];
            newOrders[orderIndex] = verifiedOrder;

            resolve(verifiedOrder);
            return { orders: newOrders };
          });
        });
      },

      // Clear the state
      cancelOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? { ...order, status: "cancelled" as const }
              : order
          ),
        }));
      },

      getOrderById: (orderId) => {
        return get().orders.find((order) => order.id === orderId);
      },

      getPendingOrders: () => {
        return get().orders.filter((order) => order.status === "pending");
      },

      getVerifiedOrders: () => {
        return get().orders.filter((order) => order.status === "verified");
      },
    }),
    {
      name: "order-storage", // unique name for localStorage key
      partialize: (state) => ({ orders: state.orders }),
    }
  )
);

export default useOrderStore;
