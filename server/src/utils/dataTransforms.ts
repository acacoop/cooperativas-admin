import { Invoice, InvoiceItem, InvoiceAttachment, User, Cooperative } from '../models';

// Transform Prisma Invoice to Frontend format
export function transformInvoiceForFrontend(invoice: any): any {
  if (!invoice) return null;

  return {
    id: invoice.id,
    invoice_number: invoice.invoiceNumber,
    issue_date: invoice.issueDate,
    issuer_cuit: invoice.issuerCuit,
    receiver_cuit: invoice.receiverCuit,
    cooperative_id: invoice.cooperativeId,
    supplier_id: invoice.supplierId,
    subtotal: invoice.subtotal,
    iva_amount: invoice.ivaAmount,
    total_amount: invoice.totalAmount,
    status: invoice.status,
    file_path: invoice.filePath,
    original_filename: invoice.originalFilename,
    rejection_reason: invoice.rejectionReason,
    status_updated_by: invoice.statusUpdatedBy,
    cost_center: invoice.costCenter,
    category: invoice.category,
    created_at: invoice.createdAt,
    updated_at: invoice.updatedAt,
    validated_at: invoice.validatedAt,
    sent_at: invoice.sentAt,
    responded_at: invoice.respondedAt,
    
    // Transform nested objects
    items: invoice.items?.map(transformInvoiceItemForFrontend),
    attachments: invoice.attachments?.map(transformInvoiceAttachmentForFrontend),
    
    // Transform related objects
    supplier_name: invoice.supplier?.companyName,
    supplier_contact: invoice.supplier?.fullName,
    cooperative_name: invoice.cooperative?.name,
  };
}

// Transform Prisma InvoiceItem to Frontend format
export function transformInvoiceItemForFrontend(item: any): any {
  if (!item) return null;

  return {
    id: item.id,
    invoice_id: item.invoiceId,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total_price: item.totalPrice,
    created_at: item.createdAt,
  };
}

// Transform Prisma InvoiceAttachment to Frontend format
export function transformInvoiceAttachmentForFrontend(attachment: any): any {
  if (!attachment) return null;

  return {
    id: attachment.id,
    invoice_id: attachment.invoiceId,
    file_path: attachment.filePath,
    original_filename: attachment.originalFilename,
    file_size: attachment.fileSize,
    mime_type: attachment.mimeType,
    description: attachment.description,
    created_at: attachment.createdAt,
  };
}

// Transform array of invoices
export function transformInvoicesForFrontend(invoices: any[]): any[] {
  if (!Array.isArray(invoices)) return [];
  return invoices.map(transformInvoiceForFrontend);
}