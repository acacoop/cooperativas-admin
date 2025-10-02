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
  invoice_system_active?: number;
  activated_at?: string;
  activated_by?: number;
  admin_user_id?: number;
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

export interface InvoiceAttachment {
  id?: number;
  invoice_id: number;
  file_path: string;
  original_filename: string;
  file_size?: number;
  mime_type?: string;
  description?: string;
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
  attachments?: InvoiceAttachment[];
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

export type CooperativeUserRole = 'admin' | 'aprobador' | 'visualizador';

export interface CooperativeUser {
  id: number;
  user_id: number;
  cooperative_id: number;
  role: CooperativeUserRole;
  created_by?: number;
  created_at: string;
  updated_at: string;
  // Join fields
  username?: string;
  email?: string;
  full_name?: string;
}

export interface CooperativeSupplier {
  id: number;
  cooperative_id: number;
  supplier_id: number;
  status: 'activo' | 'inactivo' | 'suspendido';
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  notes?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
  // Join fields
  company_name?: string;
  cuit?: string;
  email?: string;
}

export interface UserInvitation {
  id: number;
  cooperative_id: number;
  email: string;
  role: CooperativeUserRole;
  token: string;
  invited_by: number;
  status: 'pendiente' | 'aceptada' | 'rechazada' | 'expirada';
  expires_at: string;
  created_at: string;
  accepted_at?: string;
}
