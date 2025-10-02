import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { authenticateToken, checkRole } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();
const invoiceController = new InvoiceController();

// Static routes first
router.post('/upload', authenticateToken, checkRole(['proveedor']), upload.single('invoice'), invoiceController.upload);
router.post('/send-to-powerautomate', authenticateToken, checkRole(['proveedor']), upload.single('invoice'), invoiceController.sendToPowerAutomate);
router.get('/supplier', authenticateToken, checkRole(['proveedor']), invoiceController.getSupplierInvoices);
router.get('/cooperative', authenticateToken, checkRole(['admin_coop']), invoiceController.getCooperativeInvoices);
router.get('/export/csv', authenticateToken, checkRole(['admin_coop']), invoiceController.exportToCSV);

// Dynamic routes with parameters
router.get('/:id', authenticateToken, invoiceController.getInvoice);
router.get('/:id/items', authenticateToken, invoiceController.getInvoiceItems);
router.get('/:id/download', authenticateToken, invoiceController.downloadInvoice);
router.put('/:id/validate', authenticateToken, checkRole(['proveedor']), invoiceController.validateInvoice);
router.put('/:id/respond', authenticateToken, checkRole(['admin_coop']), invoiceController.respondToInvoice);

// Attachment routes
router.post('/:id/attachments', authenticateToken, checkRole(['proveedor']), upload.array('attachments', 10), invoiceController.uploadAttachments as any);
router.get('/:id/attachments/:attachmentId/download', authenticateToken, invoiceController.downloadAttachment as any);
router.delete('/:id/attachments/:attachmentId', authenticateToken, checkRole(['proveedor']), invoiceController.deleteAttachment as any);

export default router;
