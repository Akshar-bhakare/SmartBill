import { z } from 'zod';

export const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Item description is required'),
  quantity: z.number().int().gt(0, 'Quantity must be greater than 0'),
  unitPrice: z.number().int().min(0, 'Unit price cannot be negative'),
  taxRate: z.number().min(0, 'Tax rate cannot be negative').default(0),
});

const invoiceBaseSchema = z.object({
  customerId: z.string().optional().nullable(),
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Invalid customer email'),
  customerPhone: z.string().optional().nullable(),
  customerAddress: z.string().optional().nullable(),

  businessName: z.string().min(1, 'Business name is required'),
  businessEmail: z.string().email('Invalid business email'),
  businessPhone: z.string().optional().nullable(),
  businessAddress: z.string().optional().nullable(),
  businessLogo: z.string().optional().nullable(),

  issueDate: z.string().or(z.date()).transform((val) => new Date(val)),
  dueDate: z.string().or(z.date()).transform((val) => new Date(val)),

  discountType: z.enum(['PERCENTAGE', 'FIXED']).default('PERCENTAGE'),
  discountValue: z.number().min(0, 'Discount cannot be negative').default(0),

  status: z.enum(['DRAFT', 'UNPAID', 'PAID', 'OVERDUE']).default('UNPAID'),

  notes: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),

  items: z.array(invoiceItemSchema).min(1, 'Invoice must contain at least one line item'),
});

export const createInvoiceSchema = invoiceBaseSchema.refine((data) => data.dueDate >= data.issueDate, {
  message: 'Due date must be on or after issue date',
  path: ['dueDate'],
});

export const updateInvoiceSchema = invoiceBaseSchema.partial().refine((data) => {
  if (data.dueDate && data.issueDate && data.dueDate < data.issueDate) {
    return false;
  }
  return true;
}, {
  message: 'Due date must be on or after issue date',
  path: ['dueDate'],
});

export const updateInvoiceStatusSchema = z.object({
  status: z.enum(['DRAFT', 'UNPAID', 'PAID', 'OVERDUE']),
});
