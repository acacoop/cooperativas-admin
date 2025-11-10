import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../generated/prisma';
import { UserRepository } from '../models/repositories/UserRepository';
import { JWTPayload, UserRole } from '../types';

export class AuthController {
  private userRepository: UserRepository;

  constructor() {
    const prisma = new PrismaClient();
    this.userRepository = new UserRepository(prisma);
  }

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;

      // Use UserRepository instead of direct database query
      const user = await this.userRepository.findByUsername(username);

      if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401).json({ error: 'Credenciales inválidas' });
        return;
      }

      const payload: JWTPayload = {
        id: user.id,
        username: user.username,
        role: user.role as UserRole,
        cooperative_id: user.cooperativeId || undefined
      };

      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          cooperative_id: user.cooperativeId || undefined
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Error del servidor' });
    }
  };
}
