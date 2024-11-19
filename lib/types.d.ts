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

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  discountPercentage?: number;
  taxRate?: number;
  shippingFee?: number;
  amount: number;
  dateCreated: string;
  dueDate: string;
  status: "PAID" | "UNPAID" | "DUE" | "PENDING";
  products?: Array<{
    id: string;
    name: string;
    basePrice: number;
    quantity: number;
    price: number;
  }>;
}

type InvoiceDetailsProps = {
  invoice: Invoice;
  availableProducts: Array<{ id: string; name: string; basePrice: number }>;
  onUpdate: (updatedInvoice: Invoice) => void;
};

type revenueGrowthData = {
  name: string;
  revenue: number;
};
type revenueGrowthProps = {
  data: revenueGrowthData[];
};

type productPerformanceData = {
  name: string;
  value: number;
};

type productPerformanceProps = {
  data: productPerformanceData[];
};

type overviewData = {
  name: string;
  total: number;
};

type overviewProps = {
  data: overviewData[];
};

type orderDashboardData = {
  customer: string;
  order: string;
  orderDate: string;
  total: number;
};

type orderDashboardProps = {
  data: orderDashboardData[];
};
