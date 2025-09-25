import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import db from '../config/database';
import { Invoice, InvoiceItem } from '../types';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

export class InvoiceController {
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

      const {
        invoice_number,
        issue_date,
        issuer_cuit,
        receiver_cuit,
        subtotal,
        iva_amount,
        total_amount,
        items
      } = req.body;

      const coop = await db.get<{ id: number }>(
        'SELECT id FROM cooperatives WHERE cuit = ?',
        [receiver_cuit]
      );

      if (!coop) {
        res.status(400).json({ error: 'CUIT receptor no encontrado en cooperativas registradas' });
        return;
      }

      const result = await db.run(`
        INSERT INTO invoices (
          invoice_number, issue_date, issuer_cuit, receiver_cuit, 
          cooperative_id, supplier_id, subtotal, iva_amount, total_amount,
          file_path, original_filename, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente_validacion')
      `, [
        invoice_number, issue_date, issuer_cuit, receiver_cuit,
        coop.id, req.user.id, subtotal, iva_amount, total_amount,
        req.file.path, req.file.originalname
      ]);

      if (items && Array.isArray(JSON.parse(items))) {
        const parsedItems = JSON.parse(items);
        for (const item of parsedItems) {
          await db.run(`
            INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price)
            VALUES (?, ?, ?, ?, ?)
          `, [result.lastID, item.description, item.quantity, item.unit_price, item.total_price]);
        }
      }

      res.json({
        message: 'Factura subida exitosamente',
        invoice_id: result.lastID,
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

      const invoices = await db.all<Invoice & { cooperative_name: string }>(`
        SELECT i.*, c.name as cooperative_name 
        FROM invoices i
        LEFT JOIN cooperatives c ON i.cooperative_id = c.id
        WHERE i.supplier_id = ?
        ORDER BY i.created_at DESC
      `, [req.user.id]);

      res.json(invoices);
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

      const invoices = await db.all<Invoice & { supplier_name: string; supplier_contact: string }>(`
        SELECT i.*, u.company_name as supplier_name, u.full_name as supplier_contact
        FROM invoices i
        LEFT JOIN users u ON i.supplier_id = u.id
        WHERE i.cooperative_id = ? AND i.status IN ('enviada', 'aceptada', 'rechazada')
        ORDER BY i.sent_at DESC
      `, [req.user.cooperative_id]);

      res.json(invoices);
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

      const invoice = await db.get<Invoice>(
        'SELECT * FROM invoices WHERE id = ? AND supplier_id = ?',
        [id, req.user.id]
      );

      if (!invoice) {
        res.status(404).json({ error: 'Factura no encontrada' });
        return;
      }

      if (invoice.status !== 'pendiente_validacion') {
        res.status(400).json({ error: 'La factura ya fue procesada' });
        return;
      }

      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updates), new Date().toISOString(), id];

      await db.run(
        `UPDATE invoices SET ${fields}, status = 'enviada', validated_at = ?, sent_at = ? WHERE id = ?`,
        [...values, new Date().toISOString()]
      );

      res.json({ message: 'Factura validada y enviada a cooperativa' });
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

      const invoice = await db.get<Invoice>(
        'SELECT * FROM invoices WHERE id = ? AND cooperative_id = ?',
        [id, req.user.cooperative_id]
      );

      if (!invoice) {
        res.status(404).json({ error: 'Factura no encontrada' });
        return;
      }

      if (invoice.status !== 'enviada') {
        res.status(400).json({ error: 'La factura no está en estado válido para responder' });
        return;
      }

      const newStatus = action === 'aceptar' ? 'aceptada' : 'rechazada';
      
      await db.run(
        'UPDATE invoices SET status = ?, rejection_reason = ?, responded_at = ? WHERE id = ?',
        [newStatus, rejection_reason || null, new Date().toISOString(), id]
      );

      res.json({
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

      // Get invoice with supplier and cooperative info
      const invoice = await db.get<Invoice & { supplier_name: string; cooperative_name: string }>(`
        SELECT i.*, 
          u.company_name as supplier_name,
          c.name as cooperative_name
        FROM invoices i
        LEFT JOIN users u ON i.supplier_id = u.id
        LEFT JOIN cooperatives c ON i.cooperative_id = c.id
        WHERE i.id = ?
      `, [id]);

      if (!invoice) {
        res.status(404).json({ error: 'Factura no encontrada' });
        return;
      }

      // Check if user has permission to view this invoice
      const hasPermission = 
        (req.user?.role === 'proveedor' && invoice.supplier_id === req.user.id) ||
        (req.user?.role === 'admin_coop' && invoice.cooperative_id === req.user.cooperative_id) ||
        req.user?.role === 'admin_aca';

      if (!hasPermission) {
        res.status(403).json({ error: 'No tiene permisos para ver esta factura' });
        return;
      }

      // Get invoice items
      const items = await db.all<InvoiceItem>(
        'SELECT * FROM invoice_items WHERE invoice_id = ?',
        [id]
      );

      // Return invoice with items
      res.json({
        ...invoice,
        items
      });

    } catch (error) {
      console.error('Get invoice error:', error);
      res.status(500).json({ error: 'Error al obtener factura' });
    }
  }

  public async getInvoiceItems(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const items = await db.all<InvoiceItem>(
        'SELECT * FROM invoice_items WHERE invoice_id = ?',
        [id]
      );

      res.json(items);
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

      const invoices = await db.all<Invoice & { supplier_name: string }>(`
        SELECT 
          i.invoice_number,
          i.issue_date,
          i.issuer_cuit,
          i.receiver_cuit,
          i.subtotal,
          i.iva_amount,
          i.total_amount,
          u.company_name as supplier_name
        FROM invoices i
        LEFT JOIN users u ON i.supplier_id = u.id
        WHERE i.cooperative_id = ? AND i.status = 'aceptada'
        ORDER BY i.issue_date DESC
      `, [req.user.cooperative_id]);

      const csvHeader = 'Numero Factura,Fecha,CUIT Emisor,CUIT Receptor,Subtotal,IVA,Total,Proveedor\n';
      const csvRows = invoices.map(inv => 
        `${inv.invoice_number},${inv.issue_date},${inv.issuer_cuit},${inv.receiver_cuit},${inv.subtotal},${inv.iva_amount},${inv.total_amount},"${inv.supplier_name}"`
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

      const invoice = await db.get<Invoice>('SELECT * FROM invoices WHERE id = ?', [id]);

      if (!invoice) {
        res.status(404).json({ error: 'Factura no encontrada' });
        return;
      }

      const hasPermission = 
        (req.user?.role === 'proveedor' && invoice.supplier_id === req.user.id) ||
        (req.user?.role === 'admin_coop' && invoice.cooperative_id === req.user.cooperative_id) ||
        req.user?.role === 'admin_aca';

      if (!hasPermission) {
        res.status(403).json({ error: 'Sin permisos para descargar este archivo' });
        return;
      }

      if (!invoice.file_path || !fs.existsSync(invoice.file_path)) {
        res.status(404).json({ error: 'Archivo no encontrado en el servidor' });
        return;
      }

      res.download(invoice.file_path, invoice.original_filename || 'factura.pdf');
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
      const powerAutomateUrl = 'https://defaulta7cad06884854149bb950f323bdfa8.9e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/249d4f021fe64a0ca536cc507aa2715a/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=pd9Gcfkg34yDr8Bmhd7z038JqLRtH5akRhvirdnwRUY';

      console.log('Enviando factura a Power Automate:', req.file.originalname);
      
      // Enviar a Power Automate
      const response = await axios.post(powerAutomateUrl, powerAutomateData, {
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

      res.json({
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
