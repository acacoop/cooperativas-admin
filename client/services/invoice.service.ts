import { Invoice } from '@/types';
import api from '@/utils/api';

export const invoiceService = {
  async getSupplierInvoices() {
    return api.getSupplierInvoices();
  },

  async getCooperativeInvoices() {
    return api.getCooperativeInvoices();
  },

  async getInvoice(id: number) {
    return api.getInvoice(id);
  },

  async uploadInvoice(formData: FormData) {
    return api.uploadInvoice(formData);
  },

  async validateInvoice(id: number, data: Partial<Invoice>) {
    return api.validateInvoice(id, data);
  },

  async respondToInvoice(id: number, action: 'aceptar' | 'rechazar', rejectionReason?: string) {
    return api.respondToInvoice(id, action, rejectionReason);
  },

  async downloadInvoice(id: number) {
    return api.downloadInvoice(id);
  }
};
