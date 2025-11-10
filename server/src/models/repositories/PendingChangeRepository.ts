import { PrismaClient } from '../../generated/prisma';

export interface PendingChangeWithDetails {
  id: number;
  cooperativeId: number;
  userId: number;
  changes: string;
  status: string;
  createdAt: Date;
  reviewedBy?: number;
  reviewedAt?: Date;
  cooperative: {
    name: string;
  };
  user: {
    username: string;
  };
}

export class PendingChangeRepository {
  constructor(private prisma: PrismaClient) {}

  async create(cooperativeId: number, userId: number, changes: object): Promise<any> {
    return await this.prisma.pendingChange.create({
      data: {
        cooperativeId,
        userId,
        changes: JSON.stringify(changes),
        status: 'pending'
      }
    });
  }

  async findAllPending(): Promise<PendingChangeWithDetails[]> {
    return await this.prisma.pendingChange.findMany({
      where: { status: 'pending' },
      include: {
        cooperative: {
          select: { name: true }
        },
        user: {
          select: { username: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }) as PendingChangeWithDetails[];
  }

  async findById(id: number): Promise<any> {
    return await this.prisma.pendingChange.findUnique({
      where: { id },
      include: {
        cooperative: true,
        user: true
      }
    });
  }

  async updateStatus(id: number, status: string, reviewedBy: number): Promise<any> {
    return await this.prisma.pendingChange.update({
      where: { id },
      data: {
        status,
        reviewedBy,
        reviewedAt: new Date()
      }
    });
  }
}