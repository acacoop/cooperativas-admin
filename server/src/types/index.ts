export type UserRole = 'admin_aca' | 'operador_aca' | 'admin_coop' | 'proveedor';

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  cooperative_id?: number;
  full_name?: string;
  company_name?: string;
  cuit?: string;
  created_at: string;
}

export interface JWTPayload {
  id: number;
  username: string;
  role: UserRole;
  cooperative_id?: number;
}

export interface Cooperative {
  id: number;
  code: number;
  cuit: string;
  name: string;
  votes: number;
  substitutes: number;
  car: number;
  car_name: string;
  verification_code: string;
  address: string;
  phone: string;
  email: string;
  president: string;
  secretary: string;
  treasurer: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id?: number;
  invoice_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at?: string;
}

export interface Invoice {
  id?: number;
  invoice_number: string;
  issue_date: string;
  issuer_cuit: string;
  receiver_cuit: string;
  cooperative_id?: number;
  supplier_id?: number;
  subtotal: number;
  iva_amount: number;
  total_amount: number;
  status: 'pendiente_validacion' | 'enviada' | 'aceptada' | 'rechazada';
  file_path?: string;
  original_filename?: string;
  rejection_reason?: string;
  created_at?: string;
  updated_at?: string;
  validated_at?: string;
  sent_at?: string;
  responded_at?: string;
  items?: InvoiceItem[];
}

export interface PendingChange {
  id: number;
  cooperative_id: number;
  user_id: number;
  changes: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_by?: number;
  reviewed_at?: string;
}
