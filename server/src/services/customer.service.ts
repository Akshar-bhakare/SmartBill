import { prisma } from '../config/database.js';

export interface CreateCustomerDTO {
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
}

export class CustomerService {
  static async getAllCustomers() {
    return await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { invoices: true },
        },
      },
    });
  }

  static async getCustomerById(id: string) {
    return await prisma.customer.findUnique({
      where: { id },
      include: { invoices: true },
    });
  }

  static async createCustomer(data: CreateCustomerDTO) {
    return await prisma.customer.create({
      data,
    });
  }

  static async updateCustomer(id: string, data: Partial<CreateCustomerDTO>) {
    return await prisma.customer.update({
      where: { id },
      data,
    });
  }

  static async deleteCustomer(id: string) {
    return await prisma.customer.delete({
      where: { id },
    });
  }
}
