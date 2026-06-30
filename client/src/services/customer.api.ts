import { apiClient } from './api';
import { Customer } from '../types/invoice';

export const customerApi = {
  async getAll(): Promise<Customer[]> {
    const res = await apiClient.get<{ success: boolean; data: Customer[] }>('/customers');
    return res.data.data;
  },

  async getById(id: string): Promise<Customer> {
    const res = await apiClient.get<{ success: boolean; data: Customer }>(`/customers/${id}`);
    return res.data.data;
  },

  async create(payload: Partial<Customer>): Promise<Customer> {
    const res = await apiClient.post<{ success: boolean; data: Customer }>('/customers', payload);
    return res.data.data;
  },

  async update(id: string, payload: Partial<Customer>): Promise<Customer> {
    const res = await apiClient.put<{ success: boolean; data: Customer }>(`/customers/${id}`, payload);
    return res.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/customers/${id}`);
  },
};
