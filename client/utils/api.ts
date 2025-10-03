import axios, { AxiosInstance } from 'axios';
import { AuthResponse, Invoice, Cooperative, ApiResponse } from '@/types';

class Api {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  setToken(token: string | null) {
    if (token) {
      this.client.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.Authorization;
    }
  }

  // Auth
  async login(username: string, password: string): Promise<AuthResponse> {
    const { data } = await this.client.post<AuthResponse>('/auth/login', { username, password });
    return data;
  }

  // Invoices
  async uploadInvoice(formData: FormData): Promise<ApiResponse<{ invoice_id: number }>> {
    const { data } = await this.client.post<ApiResponse<{ invoice_id: number }>>(
      '/invoices/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return data;
  }

  async sendToPowerAutomate(formData: FormData): Promise<ApiResponse<{ powerAutomateResponse: any }>> {
    const { data } = await this.client.post<ApiResponse<{ powerAutomateResponse: any }>>(
      '/invoices/send-to-powerautomate',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return data;
  }

  async getSupplierInvoices(): Promise<Invoice[]> {
    const { data } = await this.client.get<Invoice[]>('/invoices/supplier');
    return data;
  }

  async getCooperativeInvoices(): Promise<Invoice[]> {
    const { data } = await this.client.get<Invoice[]>('/invoices/cooperative');
    return data;
  }

  async validateInvoice(id: number, updates: Partial<Invoice>): Promise<ApiResponse<void>> {
    const { data } = await this.client.put<ApiResponse<void>>(`/invoices/${id}/validate`, updates);
    return data;
  }

  async respondToInvoice(
    id: number,
    action: 'aceptar' | 'rechazar',
    rejection_reason?: string
  ): Promise<ApiResponse<void>> {
    const { data } = await this.client.put<ApiResponse<void>>(`/invoices/${id}/respond`, {
      action,
      rejection_reason
    });
    return data;
  }

  // Cooperatives
  async getCooperatives(): Promise<Cooperative[]> {
    const { data } = await this.client.get<Cooperative[]>('/cooperatives');
    return data;
  }

  async getCooperative(id: number): Promise<Cooperative> {
    const { data } = await this.client.get<Cooperative>(`/cooperatives/${id}`);
    return data;
  }

  async updateCooperative(id: number, updates: Partial<Cooperative>): Promise<ApiResponse<void>> {
    const { data } = await this.client.put<ApiResponse<void>>(`/cooperatives/${id}`, updates);
    return data;
  }

  async getInvoice(id: number): Promise<Invoice & { id: number }> {
    const { data } = await this.client.get<Invoice & { id: number }>(`/invoices/${id}`);
    return data;
  }

  async downloadInvoice(id: number): Promise<{ blob: Blob; filename: string }> {
    const response = await this.client.get(`/invoices/${id}/download`, {
      responseType: 'blob',
      headers: {
        Accept: 'application/pdf,application/octet-stream'
      }
    });
    
    // Get the filename from the Content-Disposition header
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'factura.pdf';
    if (contentDisposition) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }

    return { 
      blob: response.data,
      filename
    };
  }

  // Attachments
  async uploadAttachments(invoiceId: number, formData: FormData): Promise<ApiResponse<{ attachment_ids: number[]; count: number }>> {
    const { data } = await this.client.post<ApiResponse<{ attachment_ids: number[]; count: number }>>(
      `/invoices/${invoiceId}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return data;
  }

  async downloadAttachment(invoiceId: number, attachmentId: number): Promise<{ blob: Blob; filename: string }> {
    const response = await this.client.get(`/invoices/${invoiceId}/attachments/${attachmentId}/download`, {
      responseType: 'blob',
      headers: {
        Accept: 'application/octet-stream'
      }
    });
    
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'adjunto';
    if (contentDisposition) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }

    return { 
      blob: response.data,
      filename
    };
  }

  async deleteAttachment(invoiceId: number, attachmentId: number): Promise<ApiResponse<void>> {
    const { data } = await this.client.delete<ApiResponse<void>>(`/invoices/${invoiceId}/attachments/${attachmentId}`);
    return data;
  }

  // Admin - Cooperative Activation
  async activateCooperative(
    cooperativeId: number,
    userData: {
      username: string;
      email: string;
      full_name: string;
      password: string;
    }
  ): Promise<ApiResponse<{ cooperative_id: number; admin_user_id: number; username: string; email: string }>> {
    const { data } = await this.client.post<ApiResponse<{ cooperative_id: number; admin_user_id: number; username: string; email: string }>>(
      `/admin/cooperatives/${cooperativeId}/activate`,
      userData
    );
    return data;
  }

  async deactivateCooperative(cooperativeId: number): Promise<ApiResponse<void>> {
    const { data } = await this.client.post<ApiResponse<void>>(`/admin/cooperatives/${cooperativeId}/deactivate`);
    return data;
  }

  async getCooperativeStats(): Promise<{ total: number; active: number; inactive: number }> {
    const { data } = await this.client.get<{ total: number; active: number; inactive: number }>('/admin/cooperatives/stats');
    return data;
  }
}

const api = new Api();
export default api;
