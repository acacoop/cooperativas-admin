import { useState, useEffect } from 'react';
import { Invoice } from '@/types';
import { invoiceService } from '@/services/invoice.service';

export function useInvoice(id: number) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await invoiceService.getInvoice(id);
      setInvoice(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar factura');
    } finally {
      setLoading(false);
    }
  };

  return { invoice, loading, error, reloadInvoice: loadInvoice };
}

export function useInvoiceList(type: 'supplier' | 'cooperative') {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInvoices();
  }, [type]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await (type === 'supplier' 
        ? invoiceService.getSupplierInvoices()
        : invoiceService.getCooperativeInvoices());
      setInvoices(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar facturas');
    } finally {
      setLoading(false);
    }
  };

  return { invoices, loading, error, reloadInvoices: loadInvoices };
}
