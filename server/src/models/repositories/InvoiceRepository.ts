import { PrismaClient } from '../../generated/prisma';
import { InvoiceWithDetails, CreateInvoiceData } from '../index';

export class InvoiceRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<InvoiceWithDetails[]> {
    return await this.prisma.invoice.findMany({
      include: {
        items: true,
        attachments: true,
        supplier: true,
        cooperative: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: number): Promise<InvoiceWithDetails | null> {
    return await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
        attachments: true,
        supplier: true,
        cooperative: true
      }
    });
  }

  async findByCooperativeId(cooperativeId: number): Promise<InvoiceWithDetails[]> {
    return await this.prisma.invoice.findMany({
      where: { cooperativeId },
      include: {
        items: true,
        attachments: true,
        supplier: true,
        cooperative: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findByStatus(status: string): Promise<InvoiceWithDetails[]> {
    return await this.prisma.invoice.findMany({
      where: { status },
      include: {
        items: true,
        attachments: true,
        supplier: true,
        cooperative: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findBySupplier(supplierId: number): Promise<InvoiceWithDetails[]> {
    return await this.prisma.invoice.findMany({
      where: { supplierId },
      include: {
        items: true,
        attachments: true,
        supplier: true,
        cooperative: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(invoiceData: CreateInvoiceData): Promise<InvoiceWithDetails> {
    return await this.prisma.invoice.create({
      data: invoiceData,
      include: {
        items: true,
        attachments: true,
        supplier: true,
        cooperative: true
      }
    });
  }

  async updateStatus(id: number, status: string, rejectionReason?: string): Promise<InvoiceWithDetails> {
    return await this.prisma.invoice.update({
      where: { id },
      data: {
        status,
        rejectionReason,
        respondedAt: new Date()
      },
      include: {
        items: true,
        attachments: true,
        supplier: true,
        cooperative: true
      }
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.invoice.delete({
      where: { id }
    });
  }

  async getAcceptedByCooperative(cooperativeId: number): Promise<InvoiceWithDetails[]> {
    return await this.prisma.invoice.findMany({
      where: {
        cooperativeId,
        status: 'aceptada'
      },
      include: {
        items: true,
        attachments: true,
        supplier: true,
        cooperative: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async addItem(invoiceId: number, itemData: any): Promise<any> {
    return await this.prisma.invoiceItem.create({
      data: {
        invoiceId,
        description: itemData.description,
        quantity: itemData.quantity,
        unitPrice: itemData.unit_price,
        totalPrice: itemData.total_price
      }
    });
  }

  async addAttachment(invoiceId: number, attachmentData: {
    filePath: string;
    originalFilename: string;
    fileSize?: number;
    mimeType?: string;
    description?: string;
  }): Promise<any> {
    return await this.prisma.invoiceAttachment.create({
      data: {
        invoiceId,
        filePath: attachmentData.filePath,
        originalFilename: attachmentData.originalFilename,
        fileSize: attachmentData.fileSize,
        mimeType: attachmentData.mimeType,
        description: attachmentData.description
      }
    });
  }

  async findAttachment(attachmentId: number, invoiceId: number): Promise<any> {
    return await this.prisma.invoiceAttachment.findFirst({
      where: {
        id: attachmentId,
        invoiceId: invoiceId
      }
    });
  }

  async deleteAttachment(attachmentId: number): Promise<void> {
    await this.prisma.invoiceAttachment.delete({
      where: { id: attachmentId }
    });
  }

  async findByIdAndSupplier(id: number, supplierId: number): Promise<InvoiceWithDetails | null> {
    return await this.prisma.invoice.findFirst({
      where: { 
        id,
        supplierId 
      },
      include: {
        items: true,
        attachments: true,
        supplier: true,
        cooperative: true
      }
    });
  }

  async validateAndSend(id: number, updates: any): Promise<InvoiceWithDetails> {
    return await this.prisma.invoice.update({
      where: { id },
      data: {
        ...updates,
        status: 'enviada',
        validatedAt: new Date(),
        sentAt: new Date()
      },
      include: {
        items: true,
        attachments: true,
        supplier: true,
        cooperative: true
      }
    });
  }
}