import { PrismaClient } from '../../generated/prisma';
import { UserWithCooperative, CreateUserData, UpdateUserData } from '../index';

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<UserWithCooperative | null> {
    return await this.prisma.user.findUnique({
      where: { email },
      include: { cooperative: true }
    });
  }

  async findByUsername(username: string): Promise<UserWithCooperative | null> {
    return await this.prisma.user.findUnique({
      where: { username },
      include: { cooperative: true }
    });
  }

  async findByEmailOrUsername(identifier: string): Promise<UserWithCooperative | null> {
    return await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      },
      include: { cooperative: true }
    });
  }

  async findById(id: number): Promise<UserWithCooperative | null> {
    return await this.prisma.user.findUnique({
      where: { id },
      include: { cooperative: true }
    });
  }

  async findByCooperativeId(cooperativeId: number): Promise<UserWithCooperative[]> {
    return await this.prisma.user.findMany({
      where: { cooperativeId },
      include: { cooperative: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(userData: CreateUserData): Promise<UserWithCooperative> {
    return await this.prisma.user.create({
      data: userData,
      include: { cooperative: true }
    });
  }

  async update(id: number, userData: UpdateUserData): Promise<UserWithCooperative> {
    return await this.prisma.user.update({
      where: { id },
      data: userData,
      include: { cooperative: true }
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.user.delete({
      where: { id }
    });
  }

  async findAll(): Promise<UserWithCooperative[]> {
    return await this.prisma.user.findMany({
      include: { cooperative: true },
      orderBy: { createdAt: 'desc' }
    });
  }
}