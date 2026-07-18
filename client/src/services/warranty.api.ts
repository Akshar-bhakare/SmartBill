import { apiClient } from './api';

export interface ParsedInvoiceData {
  customerName: string;
  customerAddress: string;
  gstin: string;
  invoiceNumber: string;
  invoiceDate: string;
  warrantyNumber: string;
  companyName: string;
  productName: string;
  quantity: number;
  manufacturer: string;
  sellerName: string;
  sellerAddress: string;
  sellerGstin: string;
  placeOfSupply: string;
}

export const warrantyApi = {
  parseInvoice: async (file: File | string) => {
    if (typeof file === 'string') {
      const response = await apiClient.post('/warranty/parse-invoice', { text: file });
      return response.data.data as ParsedInvoiceData;
    }

    const formData = new FormData();
    formData.append('invoiceFile', file);
    const response = await apiClient.post('/warranty/parse-invoice', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data as ParsedInvoiceData;
  },

  parseSerials: async (fileOrRows: File | unknown[][]) => {
    if (Array.isArray(fileOrRows)) {
      const response = await apiClient.post('/warranty/parse-serials', { rows: fileOrRows });
      return response.data.data as { serialNumbers: string[] };
    }

    const formData = new FormData();
    formData.append('excelFile', fileOrRows);
    const response = await apiClient.post('/warranty/parse-serials', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data as { serialNumbers: string[] };
  },

  generate: async (invoiceData: ParsedInvoiceData, serialNumbers: string[]) => {
    const response = await apiClient.post('/warranty/generate', { invoiceData, serialNumbers });
    return response.data.data as { fileName: string; downloadUrl: string };
  },

  history: async (params?: { search?: string; from?: string; to?: string }) => {
    const response = await apiClient.get('/warranty/history', { params });
    return response.data.data as WarrantyRecord[];
  },

  deleteRecord: async (id: string) => {
    await apiClient.delete(`/warranty/history/${id}`);
  },
};

export interface WarrantyRecord {
  id: string;
  invoiceNumber: string;
  customerName: string;
  productName: string;
  quantity: number;
  fileName: string;
  generatedAt: string;
}
