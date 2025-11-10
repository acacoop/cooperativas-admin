
// Import Prisma types for local use
import type {
  User,
  Cooperative,
  PendingChange,
  Invoice,
  InvoiceItem,
  InvoiceAttachment,
  CostCenter,
  InvoiceCategory,
  Prisma
} from '../generated/prisma';

// Re-export all Prisma types for easier imports
export type {
  User,
  Cooperative,
  PendingChange,
  Invoice,
  InvoiceItem,
  InvoiceAttachment,
  CostCenter,
  InvoiceCategory,
  Prisma
} from '../generated/prisma';

// Custom enum types for type safety (since SQLite doesn't support enums)
export type UserRole = 'admin_aca' | 'operador_aca' | 'admin_coop' | 'proveedor';
export type ChangeStatus = 'pending' | 'approved' | 'rejected';

// Export custom types for your application
export type UserWithCooperative = User & {
  cooperative?: Cooperative | null;
};

export type CooperativeWithUsers = Cooperative & {
  users: User[];
  _count?: {
    invoices: number;
    users: number;
  };
};

export type InvoiceWithDetails = Invoice & {
  items: InvoiceItem[];
  attachments: InvoiceAttachment[];
  supplier?: User | null;
  cooperative?: Cooperative | null;
};

export type CreateUserData = Prisma.UserCreateInput;
export type UpdateUserData = Prisma.UserUpdateInput;

export type CreateCooperativeData = Prisma.CooperativeCreateInput;
export type UpdateCooperativeData = Prisma.CooperativeUpdateInput;

export type CreateInvoiceData = Prisma.InvoiceCreateInput;