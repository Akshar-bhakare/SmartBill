import { apiClient } from './api';
import { Invoice, InvoiceStatus, DashboardStats } from '../types/invoice';

export const invoiceApi = {
  async getAll(search?: string, status?: string): Promise<Invoice[]> {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (status && status !== 'ALL') params.status = status;

    const res = await apiClient.get<{ success: boolean; data: Invoice[] }>('/invoices', { params });
    return res.data.data;
  },

  async getById(id: string): Promise<Invoice> {
    const res = await apiClient.get<{ success: boolean; data: Invoice }>(`/invoices/${id}`);
    return res.data.data;
  },

  async create(payload: any): Promise<Invoice> {
    const res = await apiClient.post<{ success: boolean; data: Invoice }>('/invoices', payload);
    return res.data.data;
  },

  async update(id: string, payload: any): Promise<Invoice> {
    const res = await apiClient.put<{ success: boolean; data: Invoice }>(`/invoices/${id}`, payload);
    return res.data.data;
  },

  async updateStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
    const res = await apiClient.patch<{ success: boolean; data: Invoice }>(`/invoices/${id}/status`, { status });
    return res.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/invoices/${id}`);
  },

  async getStats(): Promise<DashboardStats> {
    const res = await apiClient.get<{ success: boolean; data: DashboardStats }>('/invoices/stats');
    return res.data.data;
  },
};
