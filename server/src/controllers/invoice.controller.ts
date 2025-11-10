import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import fs from 'fs';
import axios from 'axios';
import { CooperativeRepository, InvoiceRepository } from '../models/repositories';
import { PrismaClient } from '../generated/prisma';
import { transformInvoiceForFrontend, transformInvoicesForFrontend } from '../utils/dataTransforms';

const powerAutomateUrl = process.env.POWERAUTOMATE_URL || '';

export class InvoiceController {

  private invoiceRepository: InvoiceRepository;
  private cooperativeRepository: CooperativeRepository;

  constructor() {
    const prisma = new PrismaClient();
    this.invoiceRepository = new InvoiceRepository(prisma);
    this.cooperativeRepository = new CooperativeRepository(prisma);
  }

  public async upload(req: AuthRequest & { file?: Express.Multer.File }, res: Response): Promise<void> {
    try {
      if (req.user?.role !== 'proveedor') {
        res.status(403).json({ error: 'Solo proveedores pueden subir facturas' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'Archivo requerido' });
        return;
      }

      // const {
        // invoice_number,
        // issue_date,
        // issuer_cuit,
        // receiver_cuit,
        // subtotal,
        // iva_amount,
        // total_amount,
        // items
      // } = req.body;
      
      const invoiceData = req.body;

      const coop = await this.cooperativeRepository.findByCuit(invoiceData.receiver_cuit);

      // const coop = await db.get<{ id: number }>(
        // 'SELECT id FROM cooperatives WHERE cuit = ?',
        // [receiver_cuit]
      // );

      if (!coop) {
        res.status(400).json({ error: 'CUIT receptor no encontrado en cooperativas registradas' });
        return;
      }


      // Prepare invoice data with nested items if they exist
      let createData: any = { ...invoiceData };
      
      // Remove the original string items field first to avoid conflicts
      if (createData.items) {
        delete createData.items;
      }
      
      // Add nested items creation if items exist in the original data
      if (invoiceData.items && Array.isArray(JSON.parse(invoiceData.items))) {
        const parsedItems = JSON.parse(invoiceData.items);
        createData.items = {
          create: parsedItems.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            totalPrice: item.total_price
          }))
        };
      }

      const result = await this.invoiceRepository.create(createData);

      res.status(201).json({
        message: 'Factura subida exitosamente',
        invoice_id: result.id,
        status: 'pendiente_validacion'
      });
    } catch (error) {
      console.error('Upload invoice error:', error);
      res.status(500).json({ error: 'Error al subir factura' });
    }
  }

  public async getSupplierInvoices(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.user?.role !== 'proveedor') {
        res.status(403).json({ error: 'Solo proveedores pueden ver sus facturas' });
        return;
      }
      
      const invoices = await this.invoiceRepository.findBySupplier(req.user.id!);
      const transformedInvoices = transformInvoicesForFrontend(invoices);

      res.status(200).json(transformedInvoices);
    } catch (error) {
      console.error('Get supplier invoices error:', error);
      res.status(500).json({ error: 'Error al obtener facturas' });
    }
  }

  public async getCooperativeInvoices(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.user?.role !== 'admin_coop') {
        res.status(403).json({ error: 'Solo admins de cooperativa pueden ver facturas' });
        return;
      }

      const invoices = await this.invoiceRepository.findByCooperativeId(req.user.cooperative_id!);
      const transformedInvoices = transformInvoicesForFrontend(invoices);

      res.status(200).json(transformedInvoices);
    } catch (error) {
      console.error('Get cooperative invoices error:', error);
      res.status(500).json({ error: 'Error al obtener facturas' });
    }
  }

  public async validateInvoice(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (req.user?.role !== 'proveedor') {
        res.status(403).json({ error: 'Solo proveedores pueden validar facturas' });
        return;
      }

      const invoice = await this.invoiceRepository.findByIdAndSupplier(Number(id), req.user.id!);

      if (!invoice) {
        res.status(404).json({ error: 'Factura no encontrada' });
        return;
      }

      if (invoice.status !== 'pendiente_validacion') {
        res.status(400).json({ error: 'La factura ya fue procesada' });
        return;
      }

      // Apply updates and change status to 'enviada'
      await this.invoiceRepository.validateAndSend(Number(id), updates);

      res.status(202).json({ message: 'Factura validada y enviada a cooperativa' });
    } catch (error) {
      console.error('Validate invoice error:', error);
      res.status(500).json({ error: 'Error al validar factura' });
    }
  }

  public async respondToInvoice(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { action, rejection_reason } = req.body;

      if (req.user?.role !== 'admin_coop') {
        res.status(403).json({ error: 'Solo admins de cooperativa pueden responder facturas' });
        return;
      }

      const invoice = await this.invoiceRepository.findById(Number(id));

      // const invoice = await db.get<Invoice>(
        // 'SELECT * FROM invoices WHERE id = ? AND cooperative_id = ?',
        // [id, req.user.cooperative_id]
      // );

      if (!invoice) {
        res.status(404).json({ error: 'Factura no encontrada' });
        return;
      }

      if (invoice.status !== 'enviada') {
        res.status(400).json({ error: 'La factura no está en estado válido para responder' });
        return;
      }

      const newStatus = action === 'aceptar' ? 'aceptada' : 'rechazada';
      
      await this.invoiceRepository.updateStatus(Number(id), newStatus, rejection_reason);

      // await db.run(
        // 'UPDATE invoices SET status = ?, rejection_reason = ?, responded_at = ? WHERE id = ?',
        // [newStatus, rejection_reason || null, new Date().toISOString(), id]
      // );

      res.status(202).json({
        message: `Factura ${action === 'aceptar' ? 'aceptada' : 'rechazada'} exitosamente`,
        status: newStatus
      });
    } catch (error) {
      console.error('Respond to invoice error:', error);
      res.status(500).json({ error: 'Error al procesar la factura' });
    }
  }

  public async getInvoice(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const invoice = await this.invoiceRepository.findById(Number(id));

      if (!invoice) {
        res.status(404).json({ error: 'Factura no encontrada' });
        return;
      }

      // Check if user has permission to view this invoice
      const hasPermission = 
        (req.user?.role === 'proveedor' && invoice.supplier?.id === req.user.id) ||
        (req.user?.role === 'admin_coop' && invoice.cooperative?.id === req.user.cooperative_id) ||
        req.user?.role === 'admin_aca';

      if (!hasPermission) {
        res.status(403).json({ error: 'No tiene permisos para ver esta factura' });
        return;
      }

      const transformedInvoice = transformInvoiceForFrontend(invoice);

      // Return invoice with items and attachments
      res.status(200).json(transformedInvoice);

    } catch (error) {
      console.error('Get invoice error:', error);
      res.status(500).json({ error: 'Error al obtener factura' });
    }
  }

  public async uploadAttachments(req: AuthRequest & { files?: Express.Multer.File[] }, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { descriptions } = req.body;

      if (req.user?.role !== 'proveedor') {
        res.status(403).json({ error: 'Solo proveedores pueden subir adjuntos' });
        return;
      }

      const invoice = await this.invoiceRepository.findByIdAndSupplier(Number(id), req.user.id!);

      if (!invoice) {
        res.status(404).json({ error: 'Factura no encontrada' });
        return;
      }

      if (!req.files || req.files.length === 0) {
        res.status(400).json({ error: 'No se recibieron archivos' });
        return;
      }

      const descriptionsArray = descriptions ? JSON.parse(descriptions) : [];
      const attachmentIds: number[] = [];

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const description = descriptionsArray[i] || '';

        const result = await this.invoiceRepository.addAttachment(Number(id), {
          filePath: file.path,
          originalFilename: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          description: description
        });

        attachmentIds.push(result.id);
      }

      res.status(201).json({
        message: 'Adjuntos subidos exitosamente',
        attachment_ids: attachmentIds,
        count: req.files.length
      });

    } catch (error) {
      console.error('Upload attachments error:', error);
      res.status(500).json({ error: 'Error al subir adjuntos' });
    }
  }

  public async downloadAttachment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, attachmentId } = req.params;

      const invoice = await this.invoiceRepository.findById(Number(id));

      if (!invoice) {
        res.status(404).json({ error: 'Factura no encontrada' });
        return;
      }

      const hasPermission = 
        (req.user?.role === 'proveedor' && invoice.supplier?.id === req.user.id) ||
        (req.user?.role === 'admin_coop' && invoice.cooperative?.id === req.user.cooperative_id) ||
        req.user?.role === 'admin_aca';

      if (!hasPermission) {
        res.status(403).json({ error: 'Sin permisos para descargar este archivo' });
        return;
      }

      const attachment = await this.invoiceRepository.findAttachment(Number(attachmentId), Number(id));

      if (!attachment) {
        res.status(404).json({ error: 'Adjunto no encontrado' });
        return;
      }

      if (!fs.existsSync(attachment.filePath)) {
        res.status(404).json({ error: 'Archivo no encontrado en el servidor' });
        return;
      }

      res.download(attachment.filePath, attachment.originalFilename);
    } catch (error) {
      console.error('Download attachment error:', error);
      res.status(500).json({ error: 'Error al descargar adjunto' });
    }
  }

  public async deleteAttachment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, attachmentId } = req.params;

      if (req.user?.role !== 'proveedor') {
        res.status(403).json({ error: 'Solo proveedores pueden eliminar adjuntos' });
        return;
      }

      const invoice = await this.invoiceRepository.findByIdAndSupplier(Number(id), req.user.id!);

      if (!invoice) {
        res.status(404).json({ error: 'Factura no encontrada' });
        return;
      }

      const attachment = await this.invoiceRepository.findAttachment(Number(attachmentId), Number(id));

      if (!attachment) {
        res.status(404).json({ error: 'Adjunto no encontrado' });
        return;
      }

      // Delete file from filesystem
      if (fs.existsSync(attachment.filePath)) {
        fs.unlinkSync(attachment.filePath);
      }

      // Delete from database
      await this.invoiceRepository.deleteAttachment(Number(attachmentId));

      res.status(200).json({ message: 'Adjunto eliminado exitosamente' });
    } catch (error) {
      console.error('Delete attachment error:', error);
      res.status(500).json({ error: 'Error al eliminar adjunto' });
    }
  }

  public async getInvoiceItems(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const items = await this.invoiceRepository.findById(Number(id)).then(inv => inv?.items || []);
      // const items = await db.all<InvoiceItem>(
        // 'SELECT * FROM invoice_items WHERE invoice_id = ?',
        // [id]
      // );

      res.status(200).json(items);
    } catch (error) {
      console.error('Get invoice items error:', error);
      res.status(500).json({ error: 'Error al obtener items' });
    }
  }

  public async exportToCSV(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.user?.role !== 'admin_coop') {
        res.status(403).json({ error: 'Solo admins de cooperativa pueden exportar' });
        return;
      }

      const invoices = await this.invoiceRepository.getAcceptedByCooperative(req.user.cooperative_id!);
      // const invoices = await db.all<Invoice & { supplier_name: string }>(`
        // SELECT 
          // i.invoice_number,
          // i.issue_date,
          // i.issuer_cuit,
          // i.receiver_cuit,
          // i.subtotal,
          // i.iva_amount,
          // i.total_amount,
          // u.company_name as supplier_name
        // FROM invoices i
        // LEFT JOIN users u ON i.supplier_id = u.id
        // WHERE i.cooperative_id = ? AND i.status = 'aceptada'
        // ORDER BY i.issue_date DESC
      // `, [req.user.cooperative_id]);

      const csvHeader = 'Numero Factura,Fecha,CUIT Emisor,CUIT Receptor,Subtotal,IVA,Total,Proveedor\n';
      const csvRows = invoices.map(inv => 
        `${inv.invoiceNumber},${inv.issueDate},${inv.issuerCuit},${inv.receiverCuit},${inv.subtotal},${inv.ivaAmount},${inv.totalAmount},"${inv.supplier?.companyName}"`
      ).join('\n');

      const csvContent = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=facturas_aceptadas.csv');
      res.send(csvContent);
    } catch (error) {
      console.error('Export invoices error:', error);
      res.status(500).json({ error: 'Error al exportar facturas' });
    }
  }

  public async downloadInvoice(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const invoice = await this.invoiceRepository.findById(Number(id));
      // const invoice = await db.get<Invoice>('SELECT * FROM invoices WHERE id = ?', [id]);

      if (!invoice) {
        res.status(404).json({ error: 'Factura no encontrada' });
        return;
      }

      const hasPermission = 
        (req.user?.role === 'proveedor' && invoice.supplierId === req.user.id) ||
        (req.user?.role === 'admin_coop' && invoice.cooperativeId === req.user.cooperative_id) ||
        req.user?.role === 'admin_aca';

      if (!hasPermission) {
        res.status(403).json({ error: 'Sin permisos para descargar este archivo' });
        return;
      }

      if (!invoice.filePath || !fs.existsSync(invoice.filePath)) {
        res.status(404).json({ error: 'Archivo no encontrado en el servidor' });
        return;
      }

      res.download(invoice.filePath, invoice.originalFilename || 'factura.pdf');
    } catch (error) {
      console.error('Download invoice error:', error);
      res.status(500).json({ error: 'Error al descargar factura' });
    }
  }

  public async sendToPowerAutomate(req: AuthRequest & { file?: Express.Multer.File }, res: Response): Promise<void> {
    try {
      if (req.user?.role !== 'proveedor') {
        res.status(403).json({ error: 'Solo proveedores pueden enviar facturas' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'Archivo requerido' });
        return;
      }

      // Convertir archivo a base64
      const fileBuffer = fs.readFileSync(req.file.path);
      const fileBase64 = fileBuffer.toString('base64');
      
      // Preparar datos para Power Automate
      const powerAutomateData = {
        filename: req.file.originalname,
        content: fileBase64
      };

      // URL del endpoint de Power Automate
      const PAURL = powerAutomateUrl || '';

      console.log('Enviando factura a Power Automate:', req.file.originalname);
      
      // Enviar a Power Automate
      const response = await axios.post(PAURL, powerAutomateData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 segundos de timeout
      });

      console.log('Respuesta de Power Automate:', response.data);

      // Limpiar archivo temporal
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(200).json({
        message: 'Factura enviada exitosamente a Power Automate',
        powerAutomateResponse: response.data,
        status: response.status
      });

    } catch (error: any) {
      console.error('Error enviando a Power Automate:', error);
      
      // Limpiar archivo temporal en caso de error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({ 
        error: 'Error al enviar factura a Power Automate',
        details: error.response?.data || error.message
      });
    }
  }
}
