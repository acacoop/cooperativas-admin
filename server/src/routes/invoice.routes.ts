import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { authenticateToken, checkRole } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: Gestión de facturas y documentos asociados
 */

const router = Router();
const invoiceController = new InvoiceController();

router.use(authenticateToken);

/**
 * @swagger
 * /invoices/upload:
 *   post:
 *     summary: Subir nueva factura (solo proveedores)
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - invoice
 *             properties:
 *               invoice:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de factura
 *     responses:
 *       201:
 *         description: Factura subida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       403:
 *         description: Acceso denegado - solo proveedores
 */
router.post('/upload', checkRole(['proveedor']), upload.single('invoice'), invoiceController.upload.bind(invoiceController));

/**
 * @swagger
 * /invoices/send-to-powerautomate:
 *   post:
 *     summary: Enviar factura a Power Automate para procesamiento
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               invoice:
 *                 type: string
 *                 format: binary
 *                 description: Archivo PDF de la factura
 *             required:
 *               - invoice
 *     responses:
 *       200:
 *         description: Factura enviada exitosamente a Power Automate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 powerAutomateResponse:
 *                   type: object
 *                 status:
 *                   type: number
 *       400:
 *         description: Archivo requerido
 *       403:
 *         description: Acceso denegado - solo proveedores
 *       500:
 *         description: Error al enviar a Power Automate
 */
router.post('/send-to-powerautomate', checkRole(['proveedor']), upload.single('invoice'), invoiceController.sendToPowerAutomate.bind(invoiceController));

/**
 * @swagger
 * /invoices/send-to-powerautomate:
 *   post:
 *     summary: Enviar factura a Power Automate (solo proveedores)
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - invoice
 *             properties:
 *               invoice:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de factura
 *     responses:
 *       200:
 *         description: Factura enviada a Power Automate exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       403:
 *         description: Acceso denegado - solo proveedores
 */
router.post('/send-to-powerautomate', checkRole(['proveedor']), upload.single('invoice'), invoiceController.sendToPowerAutomate);

/**
 * @swagger
 * /invoices/supplier:
 *   get:
 *     summary: Obtener facturas del proveedor (solo proveedores)
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, paid]
 *         description: Filtrar por estado
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista de facturas del proveedor
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Invoice'
 *       403:
 *         description: Acceso denegado - solo proveedores
 */
router.get('/supplier', checkRole(['proveedor']), invoiceController.getSupplierInvoices.bind(invoiceController));

/**
 * @swagger
 * /invoices/cooperative:
 *   get:
 *     summary: Obtener facturas de la cooperativa (solo admin cooperativa)
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, paid]
 *         description: Filtrar por estado
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista de facturas de la cooperativa
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Invoice'
 *       403:
 *         description: Acceso denegado - solo admin cooperativa
 */
router.get('/cooperative', checkRole(['admin_coop']), invoiceController.getCooperativeInvoices.bind(invoiceController));

/**
 * @swagger
 * /invoices/export/csv:
 *   get:
 *     summary: Exportar facturas a CSV (solo admin cooperativa)
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, paid]
 *         description: Filtrar por estado
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha desde
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha hasta
 *     responses:
 *       200:
 *         description: Archivo CSV con facturas
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       403:
 *         description: Acceso denegado - solo admin cooperativa
 */
router.get('/export/csv', checkRole(['admin_coop']), invoiceController.exportToCSV.bind(invoiceController));

/**
 * @swagger
 * /invoices/{id}:
 *   get:
 *     summary: Obtener factura por ID
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Detalles de la factura
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       404:
 *         description: Factura no encontrada
 */
router.get('/:id', invoiceController.getInvoice.bind(invoiceController));

/**
 * @swagger
 * /invoices/{id}/items:
 *   get:
 *     summary: Obtener items de factura
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Items de la factura
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   description:
 *                     type: string
 *                   quantity:
 *                     type: number
 *                   unit_price:
 *                     type: number
 *                   total:
 *                     type: number
 */
router.get('/:id/items', invoiceController.getInvoiceItems.bind(invoiceController));

/**
 * @swagger
 * /invoices/{id}/download:
 *   get:
 *     summary: Descargar archivo de factura
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Archivo de factura
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Factura no encontrada
 */
router.get('/:id/download', invoiceController.downloadInvoice.bind(invoiceController));

/**
 * @swagger
 * /invoices/{id}/validate:
 *   put:
 *     summary: Validar factura (solo proveedores)
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la factura
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_valid:
 *                 type: boolean
 *                 description: Si la factura es válida
 *               validation_notes:
 *                 type: string
 *                 description: Notas de validación
 *     responses:
 *       200:
 *         description: Factura validada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       403:
 *         description: Acceso denegado - solo proveedores
 */
router.put('/:id/validate', checkRole(['proveedor']), invoiceController.validateInvoice.bind(invoiceController));

/**
 * @swagger
 * /invoices/{id}/respond:
 *   put:
 *     summary: Responder a factura (solo admin cooperativa)
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la factura
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected, paid]
 *                 description: Estado de respuesta
 *               response_notes:
 *                 type: string
 *                 description: Notas de respuesta
 *     responses:
 *       200:
 *         description: Respuesta registrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       403:
 *         description: Acceso denegado - solo admin cooperativa
 */
router.put('/:id/respond', checkRole(['admin_coop']), invoiceController.respondToInvoice.bind(invoiceController));

/**
 * @swagger
 * /invoices/{id}/attachments:
 *   post:
 *     summary: Subir archivos adjuntos (solo proveedores)
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la factura
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 10
 *                 description: Archivos adjuntos (máximo 10)
 *     responses:
 *       200:
 *         description: Archivos subidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 uploaded_files:
 *                   type: array
 *                   items:
 *                     type: string
 *       403:
 *         description: Acceso denegado - solo proveedores
 */
router.post('/:id/attachments', checkRole(['proveedor']), upload.array('attachments', 10), invoiceController.uploadAttachments.bind(invoiceController) as any);

/**
 * @swagger
 * /invoices/{id}/attachments/{attachmentId}/download:
 *   get:
 *     summary: Descargar archivo adjunto
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la factura
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del archivo adjunto
 *     responses:
 *       200:
 *         description: Archivo adjunto
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Archivo no encontrado
 */
router.get('/:id/attachments/:attachmentId/download', invoiceController.downloadAttachment.bind(invoiceController));

/**
 * @swagger
 * /invoices/{id}/attachments/{attachmentId}:
 *   delete:
 *     summary: Eliminar archivo adjunto (solo proveedores)
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la factura
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del archivo adjunto
 *     responses:
 *       200:
 *         description: Archivo eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       403:
 *         description: Acceso denegado - solo proveedores
 *       404:
 *         description: Archivo no encontrado
 */
router.delete('/:id/attachments/:attachmentId', checkRole(['proveedor']), invoiceController.deleteAttachment.bind(invoiceController));

export default router;
