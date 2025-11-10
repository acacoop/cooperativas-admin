import { PrismaClient } from '../../generated/prisma';
import { InvoiceCategory, Prisma } from '../index';

export class InvoiceCategoryRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<InvoiceCategory[]> {
    return await this.prisma.invoiceCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
  }

  async findByCooperative(cooperativeId: number): Promise<InvoiceCategory[]> {
    return await this.prisma.invoiceCategory.findMany({
      where: { 
        cooperativeId,
        isActive: true 
      },
      orderBy: { name: 'asc' }
    });
  }

  async findById(id: number): Promise<InvoiceCategory | null> {
    return await this.prisma.invoiceCategory.findUnique({
      where: { id },
      include: { cooperative: true }
    });
  }

  async create(data: Prisma.InvoiceCategoryCreateInput): Promise<InvoiceCategory> {
    return await this.prisma.invoiceCategory.create({
      data,
      include: { cooperative: true }
    });
  }

  async update(id: number, data: Prisma.InvoiceCategoryUpdateInput): Promise<InvoiceCategory> {
    return await this.prisma.invoiceCategory.update({
      where: { id },
      data,
      include: { cooperative: true }
    });
  }

  async delete(id: number): Promise<InvoiceCategory> {
    // Soft delete by setting isActive to false
    return await this.prisma.invoiceCategory.update({
      where: { id },
      data: { isActive: false }
    });
  }

  async findByName(cooperativeId: number, name: string): Promise<InvoiceCategory | null> {
    return await this.prisma.invoiceCategory.findUnique({
      where: {
        cooperativeId_name: {
          cooperativeId,
          name
        }
      }
    });
  }
}