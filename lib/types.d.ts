type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock?: number;
  rating?: number;
  reviews?: { id: string; rating: number; comment: string; author: string }[];
};

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
type OrderDetails = {
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
};
