import { Prisma } from "@/generated/prisma/client";

interface ContactDetails {
  subject?: string;
  name: string;
  message: string;
  email: string;
  phone: string;
}

type MenuItem = Prisma.ProductGetPayload<{
  omit: {
    invoiceId: true;
  };
}> & {
  reviews?: Prisma.ReviewGetPayload<{
    omit: {
      productId: true;
    };
  }>[];
};

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  product: MenuItem & {
    invoiceId: string | null;
  };
}

interface FaqItems {
  id: number;
  question?: string;
  answer?: string | Array<string>;
}

interface OrderInfo {
  id: string;
  status: string;
  orderId: string;
  shippingInfo: {
    phoneNumber: string;
    email: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    orderNotes: string | null;
  };
  paymentDate: Date | null;
  scheduledAt: Date | null;
  products: {
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      description: string;
      price: number;
      assetId: string | null;
      category: string | null;
      rating: number | null;
    };
  }[];
  shippingFee: number;
  subtotal: number;
  tax: number;
  total: number;
  orderDate: Date | null;
  verificationCode: string | undefined;
  orderNumber: string | null;
  referenceNumber: string | null;
}

type PasswordFeedback = {
  strength: "weak" | "good" | "strong";
  errors: string[];
};

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
  id: string;
  orderId?: string;
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
  status?: "UNVERIFIED" | "PENDING" | "CANCELLED" | "FULFILLED";
};

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  discountPercentage?: number;
  discountType: "PERCENT" | "AMOUNT";
  taxRate?: number;
  taxType: "PERCENT" | "AMOUNT";
  shippingFee?: number;
  serviceCharge?: number;
  miscellaneous?: number;
  amount: number;
  amountPaid: number;
  amountDue: number;
  dateCreated: Date;
  dueDate: Date;
  status: InvoiceStatus;
  products?: Array<{
    id: string;
    name: string;
    basePrice: number;
    quantity: number;
    price: number;
    discount: number;
    category: string;
  }>;
}

type InvoiceDetailsProps = {
  invoice: Invoice;
  availableProducts: Array<{ id: string; name: string; basePrice: number }>;
  onUpdate: (updatedInvoice: Invoice) => void;
  onClose?: () => void;
};

type revenueGrowthData = {
  month: string;
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

type OrderDashboardData = {
  customer: string;
  order: string;
  orderDate: string;
  total: number;
};

type OrderDashboardProps = {
  data: OrderDashboardData[];
};

type WeeklySales = {
  week: string;
  sales: number;
  orders: number;
  averageOrderValue: number;
};

type TopProducts = {
  name: string;
  sales: number;
  revenue: number;
  unitsSold: number;
};

type MonthlySalesReport = {
  monthlySales: WeeklySales[];
  topProducts: TopProducts[];
};

/** A single row in the Monthly Sales report table - one per month*/
type MonthlyReportItem = {
  date: string;
  status: "Completed" | "In Progress" | "Unavailable";
  monthlySalesReport?: MonthlySalesReport;
};

interface MonthlyData {
  month: number;
  revenue: number;
  expenses: number;
  profit: number;
}

interface ExpenseBreakdown {
  category: string;
  amount: number;
}

interface QuarterlyData {
  quarter: number;
  monthlyData: MonthlyData[];
}

interface QuarterlyExpenseBreakdown {
  quarter: number;
  data: ExpenseBreakdown[];
}

type QuarterlyReport = {
  monthlyData: QuarterlyData[];
  expenseBreakdown: QuarterlyExpenseBreakdown[];
};

/** A single item in the Quarterly or Annual report table */
type FinancialReportItem = {
  date: string;
  status: string;
  quarterlyReport?: QuarterlyReport;
  annualPerformance?: AnnualPerformance;
};

type QuarterlyPerformanceProps = {
  quarter: string;
  sales: number;
  target: number;
  customerSatisfaction: number;
};

type KeyMetricsProps = {
  metric: string;
  value: string;
};

type AnnualPerformance = {
  quarterlyPerformance: QuarterlyPerformanceProps[];
  keyMetrics: KeyMetricsProps[];
};

/** Discriminated report section — Monthly uses MonthlyReportItem[], others use FinancialReportItem[] */
type ReportSection =
  | { type: "Monthly Sales Report"; items: MonthlyReportItem[] }
  | { type: "Quarterly Financials Report"; items: FinancialReportItem[] }
  | { type: "Annual Performance Report"; items: FinancialReportItem[] };

type AdminReportProps = {
  data: ReportSection[];
};

type ImageUploadProps = {
  value: string;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  onRemoveError?: (value: string) => void;
};

interface MonthlyRevenue {
  id?: string;
  month: string;
  projection: number;
  actual: number;
}

interface YearlyRevenue {
  id?: string;
  year: number;
  yearlyTarget: number;
  monthlyProjections: MonthlyRevenue[];
}

interface Income {
  id?: string;
  name: string;
  category: string;
  amount: number;
  date: Date | string;
}

interface Expense {
  id?: string;
  name: string;
  category: string;
  amount: number;
  date: Date | string;
}

interface RevenueData {
  projected: number;
  actual: number;
}

interface ProfitData {
  totalRevenue: number;
  profit: number;
}

interface CategoryData {
  category: string;
  value: number;
}

interface CateringDetails {
  name: string;
  email: string;
  cateringDate: Date;
  phone: string;
  message?: string;
  products: string[];
}
