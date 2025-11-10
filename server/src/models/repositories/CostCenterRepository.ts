import { PrismaClient } from '../../generated/prisma';
import { CostCenter, Prisma } from '../index';

export class CostCenterRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<CostCenter[]> {
    return await this.prisma.costCenter.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
  }

  async findByCooperative(cooperativeId: number): Promise<CostCenter[]> {
    return await this.prisma.costCenter.findMany({
      where: { 
        cooperativeId,
        isActive: true 
      },
      orderBy: { name: 'asc' }
    });
  }

  async findById(id: number): Promise<CostCenter | null> {
    return await this.prisma.costCenter.findUnique({
      where: { id },
      include: { cooperative: true }
    });
  }

  async create(data: Prisma.CostCenterCreateInput): Promise<CostCenter> {
    return await this.prisma.costCenter.create({
      data,
      include: { cooperative: true }
    });
  }

  async update(id: number, data: Prisma.CostCenterUpdateInput): Promise<CostCenter> {
    return await this.prisma.costCenter.update({
      where: { id },
      data,
      include: { cooperative: true }
    });
  }

  async delete(id: number): Promise<CostCenter> {
    // Soft delete by setting isActive to false
    return await this.prisma.costCenter.update({
      where: { id },
      data: { isActive: false }
    });
  }

  async findByName(cooperativeId: number, name: string): Promise<CostCenter | null> {
    return await this.prisma.costCenter.findUnique({
      where: {
        cooperativeId_name: {
          cooperativeId,
          name
        }
      }
    });
  }
}