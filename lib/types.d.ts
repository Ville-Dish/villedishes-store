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
  product: MenuItem & {
    invoiceId: string | null;
  };
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
  taxRate?: number;
  shippingFee?: number;
  amount: number;
  amountPaid: number;
  amountDue: number;
  dateCreated: string;
  dueDate: string;
  status: "PAID" | "UNPAID" | "DUE" | "PENDING";
  products?: Array<{
    id: string;
    name: string;
    basePrice: number;
    quantity: number;
    price: number;
    discount: number;
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

type MonthlySales = {
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
  monthlySales: MonthlySales[];
  topProducts: TopProducts[];
};

type QuarterlyProps = {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
};

type ExpenseBreakdownProps = {
  category: string;
  amount: number;
};

type QuarterlyReport = {
  quarterlyData: QuarterlyProps[];
  expenseBreakdown: ExpenseBreakdownProps[];
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

type ReportItem = {
  date: string;
  status: string;
  action?: string;
  monthlySalesReport?: MonthlySalesReport;
  quarterlyReport?: QuarterlyReport;
  annualPerformance?: AnnualPerformance;
};

type ReportData = {
  type: string;
  items: ReportItem[];
};

type AdminReportProps = {
  data: ReportData[];
};

type ImageUploadProps = {
  value: string;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  onRemoveError?: (value: string) => void;
};

interface MonthlyRevenue {
  month: string;
  projection: number;
  actual: number;
}

interface YearlyRevenue {
  year: number;
  yearlyTarget: number;
  monthlyProjections: MonthlyRevenue[];
}

interface Income {
  name: string;
  category: string;
  amount: number;
  date: string;
}

interface Expense {
  name: string;
  category: string;
  amount: number;
  date: string;
}

interface YearlyRevenueAccordionProps {
  revenueProjections: YearlyRevenue[];
  onUpdate: (
    year: number,
    updatedProjections: YearlyRevenue["monthlyProjections"]
  ) => void;
}

interface MonthlyRevenueProjectionsProps {
  year: number;
  yearlyTarget: number;
  monthlyProjections: MonthlyRevenue[];
  onUpdate: (updatedProjections: MonthlyRevenue[]) => void;
  currentYear: number;
  currentMonth: number;
}

interface SettingsTableProps {
  variant: "Revenue" | "Income" | "Expense";
  data: Income[] | Expense[];
}

interface SettingsFormProps {
  variant: "Revenue" | "Income" | "Expense";
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  isYearlyProjection?: boolean;
  setIsYearlyProjection?: (value: boolean) => void;
}
