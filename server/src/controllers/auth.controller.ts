import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database';
import { User, JWTPayload } from '../types';

export class AuthController {
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      const user = await db.get<User>('SELECT * FROM users WHERE username = ?', [username]);

      if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401).json({ error: 'Credenciales inválidas' });
        return;
      }

      const payload: JWTPayload = {
        id: user.id,
        username: user.username,
        role: user.role,
        cooperative_id: user.cooperative_id
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
          cooperative_id: user.cooperative_id
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Error del servidor' });
    }
  }
}
