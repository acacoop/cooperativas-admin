import { PrismaClient } from '../../generated/prisma';
import { CooperativeWithUsers, CreateCooperativeData, UpdateCooperativeData } from '../index';

export class CooperativeRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(options?: { where?: any }): Promise<CooperativeWithUsers[]> {
    return await this.prisma.cooperative.findMany({
      where: options?.where,
      include: {
        users: true,
        _count: {
          select: {
            invoices: true,
            users: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async findById(id: number): Promise<CooperativeWithUsers | null> {
    return await this.prisma.cooperative.findUnique({
      where: { id },
      include: {
        users: true,
        _count: {
          select: {
            invoices: true,
            users: true
          }
        }
      }
    });
  }

  async findByCode(code: number): Promise<CooperativeWithUsers | null> {
    return await this.prisma.cooperative.findUnique({
      where: { code },
      include: {
        users: true,
        _count: {
          select: {
            invoices: true,
            users: true
          }
        }
      }
    });
  }

  async findByCuit(cuit: string): Promise<CooperativeWithUsers | null> {
    return await this.prisma.cooperative.findUnique({
      where: { cuit },
      include: {
        users: true,
        _count: {
          select: {
            invoices: true,
            users: true
          }
        }
      }
    });
  }

  async create(cooperativeData: CreateCooperativeData): Promise<CooperativeWithUsers> {
    return await this.prisma.cooperative.create({
      data: cooperativeData,
      include: {
        users: true,
        _count: {
          select: {
            invoices: true,
            users: true
          }
        }
      }
    });
  }

  async update(id: number, cooperativeData: UpdateCooperativeData): Promise<CooperativeWithUsers> {
    return await this.prisma.cooperative.update({
      where: { id },
      data: {
        ...cooperativeData,
        updatedAt: new Date()
      },
      include: {
        users: true,
        _count: {
          select: {
            invoices: true,
            users: true
          }
        }
      }
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.cooperative.delete({
      where: { id }
    });
  }

  async search(searchTerm: string): Promise<CooperativeWithUsers[]> {
    return await this.prisma.cooperative.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm } },
          { cuit: { contains: searchTerm } },
          { code: { equals: parseInt(searchTerm) || 0 } }
        ]
      },
      include: {
        users: true,
        _count: {
          select: {
            invoices: true,
            users: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async getActivationStats(): Promise<{ total: number; active: number; inactive: number }> {
    // Get total count
    const total = await this.prisma.cooperative.count();
    
    // Get active count based on invoiceSystemActive field
    const active = await this.prisma.cooperative.count({
      where: { invoiceSystemActive: true }
    });
    
    const inactive = total - active;
    
    return { total, active, inactive };
  }
}