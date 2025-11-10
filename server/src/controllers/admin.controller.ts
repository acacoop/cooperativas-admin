import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../generated/prisma';
import { UserRepository } from '../models/repositories/UserRepository';
import { CooperativeRepository } from '../models/repositories/CooperativeRepository';
import { UserRole } from '../types';

export class AdminController {
  private userRepository: UserRepository;
  private cooperativeRepository: CooperativeRepository;

  constructor() {
    const prisma = new PrismaClient();
    this.userRepository = new UserRepository(prisma);
    this.cooperativeRepository = new CooperativeRepository(prisma);
  }

  public activateCooperative = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { username, email, full_name, password } = req.body;
      const adminUserId = (req as any).user.id;

      // Validaciones
      if (!username || !email || !full_name || !password) {
        res.status(400).json({ error: 'Todos los campos son requeridos' });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        return;
      }

      const cooperativeId = parseInt(id);
      if (isNaN(cooperativeId)) {
        res.status(400).json({ error: 'ID de cooperativa inválido' });
        return;
      }

      // Verificar que la cooperativa existe
      const cooperative = await this.cooperativeRepository.findById(cooperativeId);

      if (!cooperative) {
        res.status(404).json({ error: 'Cooperativa no encontrada' });
        return;
      }

      // Verificar si ya está activa
      if (cooperative.invoiceSystemActive === true) {
        res.status(400).json({ error: 'La cooperativa ya está activa' });
        return;
      }

      // Verificar que el username no esté en uso
      const existingUser = await this.userRepository.findByUsername(username);

      if (existingUser) {
        res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
        return;
      }

      // Verificar que el email no esté en uso
      const existingEmail = await this.userRepository.findByEmail(email);

      if (existingEmail) {
        res.status(400).json({ error: 'El email ya está en uso' });
        return;
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear el usuario administrador
      const newUser = await this.userRepository.create({
        username,
        email,
        password: hashedPassword,
        role: 'admin_coop' as UserRole,
        cooperative: {
          connect: { id: cooperativeId }
        },
        fullName: full_name,
        companyName: undefined,
        cuit: undefined
      });

      // Activar la cooperativa with direct Prisma update to set relations
      const prisma = new PrismaClient();
      const updatedCooperative = await prisma.cooperative.update({
        where: { id: cooperativeId },
        data: {
          invoiceSystemActive: true,
          activatedAt: new Date(),
          activatedBy: adminUserId,
          adminUserId: newUser.id,
          status: 'active'
        }
      });

      res.json({
        success: true,
        message: 'Cooperativa activada exitosamente',
        data: {
          cooperative_id: cooperativeId,
          admin_user_id: newUser.id,
          username,
          email
        }
      });

    } catch (error: any) {
      console.error('Error activating cooperative:', error);
      res.status(500).json({ error: 'Error al activar cooperativa' });
    }
  };

  public deactivateCooperative = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const adminUserId = (req as any).user.id;

      const cooperativeId = parseInt(id);
      if (isNaN(cooperativeId)) {
        res.status(400).json({ error: 'ID de cooperativa inválido' });
        return;
      }

      // Verificar que la cooperativa existe
      const cooperative = await this.cooperativeRepository.findById(cooperativeId);

      if (!cooperative) {
        res.status(404).json({ error: 'Cooperativa no encontrada' });
        return;
      }

      // Desactivar la cooperativa
      const prisma = new PrismaClient();
      await prisma.cooperative.update({
        where: { id: cooperativeId },
        data: {
          invoiceSystemActive: false,
          status: 'inactive'
        }
      });

      res.json({
        success: true,
        message: 'Cooperativa desactivada exitosamente'
      });

    } catch (error: any) {
      console.error('Error deactivating cooperative:', error);
      res.status(500).json({ error: 'Error al desactivar cooperativa' });
    }
  };

  public getCooperativeActivationStats = async (req: Request, res: Response): Promise<void> => {
    try {
      // Use the repository method for efficient stats calculation
      const stats = await this.cooperativeRepository.getActivationStats();
      res.json(stats);

    } catch (error: any) {
      console.error('Error getting stats:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  };
}
