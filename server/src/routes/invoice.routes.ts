import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { authenticateToken, checkRole } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();
const invoiceController = new InvoiceController();

router.post('/upload', authenticateToken, checkRole(['proveedor']), upload.single('invoice'), invoiceController.upload);
router.get('/supplier', authenticateToken, checkRole(['proveedor']), invoiceController.getSupplierInvoices);
router.get('/cooperative', authenticateToken, checkRole(['admin_coop']), invoiceController.getCooperativeInvoices);
router.put('/:id/validate', authenticateToken, checkRole(['proveedor']), invoiceController.validateInvoice);
router.put('/:id/respond', authenticateToken, checkRole(['admin_coop']), invoiceController.respondToInvoice);
router.get('/:id/items', authenticateToken, invoiceController.getInvoiceItems);
router.get('/export/csv', authenticateToken, checkRole(['admin_coop']), invoiceController.exportToCSV);
router.get('/:id/download', authenticateToken, invoiceController.downloadInvoice);

export default router;
