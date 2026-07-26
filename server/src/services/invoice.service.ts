import { prisma } from '../config/database.js';
import { calculateInvoiceTotal, CalculationItemInput } from '../utils/calculations.js';
import { generateInvoiceNumber } from '../utils/invoiceNumber.js';
import { InvoiceStatus, DiscountType } from '@prisma/client';

export interface CreateInvoiceDTO {
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

  issueDate: Date;
  dueDate: Date;

  discountType?: 'PERCENTAGE' | 'FIXED';
  discountValue?: number;
  status?: 'DRAFT' | 'UNPAID' | 'PAID' | 'OVERDUE';

  notes?: string | null;
  terms?: string | null;

  items: CalculationItemInput[];
}

export class InvoiceService {
  /**
   * Helper to automatically check and update overdue status for unpaid invoices whose due date has passed.
   */
  private static async updateOverdueStatuses() {
    const now = new Date();
    await prisma.invoice.updateMany({
      where: {
        status: InvoiceStatus.UNPAID,
        dueDate: { lt: now },
      },
      data: {
        status: InvoiceStatus.OVERDUE,
      },
    });
  }

  static async getAllInvoices(search?: string, statusFilter?: string) {
    await this.updateOverdueStatuses();

    const where: any = {};

    if (statusFilter && statusFilter !== 'ALL') {
      where.status = statusFilter;
    }

    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { invoiceNumber: { contains: q, mode: 'insensitive' } },
        { customerName: { contains: q, mode: 'insensitive' } },
        { customerEmail: { contains: q, mode: 'insensitive' } },
        { businessName: { contains: q, mode: 'insensitive' } },
      ];
    }

    return await prisma.invoice.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getInvoiceById(id: string) {
    await this.updateOverdueStatuses();
    return await prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  static async createInvoice(data: CreateInvoiceDTO) {
    // 1. Backend independent calculation of invoice totals
    const calc = calculateInvoiceTotal(
      data.items,
      data.discountType || 'PERCENTAGE',
      data.discountValue || 0
    );

    // 2. Generate unique invoice number
    const count = await prisma.invoice.count();
    const invoiceNumber = generateInvoiceNumber(count + 1);

    // 3. Check overdue status
    const now = new Date();
    let status: InvoiceStatus = (data.status as InvoiceStatus) || InvoiceStatus.UNPAID;
    if (status === InvoiceStatus.UNPAID && data.dueDate < now) {
      status = InvoiceStatus.OVERDUE;
    }

    // 4. Save invoice with item snapshot
    return await prisma.invoice.create({
      data: {
        invoiceNumber,
        status,
        customerId: data.customerId || null,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress,

        businessName: data.businessName,
        businessEmail: data.businessEmail,
        businessPhone: data.businessPhone,
        businessAddress: data.businessAddress,
        businessLogo: data.businessLogo,

        issueDate: data.issueDate,
        dueDate: data.dueDate,

        subtotal: calc.subtotal,
        discountType: (data.discountType as DiscountType) || DiscountType.PERCENTAGE,
        discountValue: data.discountValue || 0,
        discountAmount: calc.discountAmount,
        taxTotal: calc.taxTotal,
        total: calc.total,

        notes: data.notes,
        terms: data.terms,

        items: {
          create: calc.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            lineTotal: item.lineTotal,
          })),
        },
      },
      include: { items: true },
    });
  }

  static async updateInvoice(id: string, data: Partial<CreateInvoiceDTO>) {
    const existing = await prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      throw new Error('Invoice not found');
    }

    // Prepare items to calculate
    const itemsToCalc: CalculationItemInput[] = data.items
      ? data.items
      : existing.items.map((i) => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          taxRate: i.taxRate,
        }));

    const discType = data.discountType || existing.discountType;
    const discVal = data.discountValue !== undefined ? data.discountValue : existing.discountValue;

    const calc = calculateInvoiceTotal(itemsToCalc, discType, discVal);

    // Delete existing items if new items provided
    if (data.items) {
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId: id },
      });
    }

    return await prisma.invoice.update({
      where: { id },
      data: {
        customerName: data.customerName ?? existing.customerName,
        customerEmail: data.customerEmail ?? existing.customerEmail,
        customerPhone: data.customerPhone ?? existing.customerPhone,
        customerAddress: data.customerAddress ?? existing.customerAddress,

        businessName: data.businessName ?? existing.businessName,
        businessEmail: data.businessEmail ?? existing.businessEmail,
        businessPhone: data.businessPhone ?? existing.businessPhone,
        businessAddress: data.businessAddress ?? existing.businessAddress,
        businessLogo: data.businessLogo ?? existing.businessLogo,

        issueDate: data.issueDate ?? existing.issueDate,
        dueDate: data.dueDate ?? existing.dueDate,
        status: (data.status as InvoiceStatus) ?? existing.status,

        subtotal: calc.subtotal,
        discountType: discType as DiscountType,
        discountValue: discVal,
        discountAmount: calc.discountAmount,
        taxTotal: calc.taxTotal,
        total: calc.total,

        notes: data.notes ?? existing.notes,
        terms: data.terms ?? existing.terms,

        items: data.items
          ? {
              create: calc.items.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                taxRate: item.taxRate,
                lineTotal: item.lineTotal,
              })),
            }
          : undefined,
      },
      include: { items: true },
    });
  }

  static async updateInvoiceStatus(id: string, status: InvoiceStatus) {
    return await prisma.invoice.update({
      where: { id },
      data: { status },
    });
  }

  static async deleteInvoice(id: string) {
    return await prisma.invoice.delete({
      where: { id },
    });
  }

  static async getDashboardStats() {
    await this.updateOverdueStatuses();

    const allInvoices = await prisma.invoice.findMany({
      orderBy: { issueDate: 'asc' },
    });

    const totalRevenue = allInvoices
      .filter((inv) => inv.status === InvoiceStatus.PAID)
      .reduce((acc, inv) => acc + inv.total, 0);

    const outstanding = allInvoices
      .filter((inv) => inv.status === InvoiceStatus.UNPAID || inv.status === InvoiceStatus.OVERDUE)
      .reduce((acc, inv) => acc + inv.total, 0);

    const paidCount = allInvoices.filter((inv) => inv.status === InvoiceStatus.PAID).length;
    const overdueCount = allInvoices.filter((inv) => inv.status === InvoiceStatus.OVERDUE).length;
    const totalCount = allInvoices.length;

    // Monthly breakdown for Recharts chart
    const monthlyMap: Record<string, { month: string; revenue: number; invoiceCount: number }> = {};

    allInvoices.forEach((inv) => {
      const monthKey = new Date(inv.issueDate).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { month: monthKey, revenue: 0, invoiceCount: 0 };
      }
      monthlyMap[monthKey].invoiceCount += 1;
      if (inv.status === InvoiceStatus.PAID) {
        monthlyMap[monthKey].revenue += inv.total / 100; // Converted to major units for chart display
      }
    });

    const chartData = Object.values(monthlyMap);

    return {
      totalRevenue,
      outstanding,
      paidCount,
      overdueCount,
      totalCount,
      chartData,
    };
  }
}
