export type InvoiceStatus = 'DRAFT' | 'UNPAID' | 'PAID' | 'OVERDUE';
export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number; // Stored in minor units (e.g. 2500000 = $25,000.00)
  taxRate: number;   // Percentage e.g. 18
  lineTotal?: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    invoices: number;
  };
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;

  customerId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  customerAddress?: string | null;

  businessName: string;
  businessEmail: string;
  businessPhone?: string | null;
  businessAddress?: string | null;
  businessLogo?: string | null;

  issueDate: string;
  dueDate: string;

  subtotal: number;       // Minor units
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number; // Minor units
  taxTotal: number;       // Minor units
  total: number;          // Minor units

  notes?: string | null;
  terms?: string | null;

  items: InvoiceItem[];

  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceFormValues {
  customerId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;

  businessName: string;
  businessEmail: string;
  businessPhone?: string;
  businessAddress?: string;

  issueDate: string;
  dueDate: string;

  discountType: DiscountType;
  discountValue: number; // Percentage or major units input by user

  status: InvoiceStatus;

  notes?: string;
  terms?: string;

  items: {
    description: string;
    quantity: number;
    unitPrice: number; // Display major units (e.g. 25000.00)
    taxRate: number;
  }[];
}

export interface DashboardStats {
  totalRevenue: number;
  outstanding: number;
  paidCount: number;
  overdueCount: number;
  totalCount: number;
  chartData: {
    month: string;
    revenue: number;
    invoiceCount: number;
  }[];
}
