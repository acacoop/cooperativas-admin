export interface InvoiceFormData {
  invoice_number: string;
  issue_date: string;
  issuer_cuit: string;
  receiver_cuit: string;
  subtotal: string;
  iva_amount: string;
  total_amount: string;
  items: InvoiceFormItem[];
}

export interface InvoiceFormItem {
  description: string;
  quantity: string;
  unit_price: string;
  total_price: string;
}
