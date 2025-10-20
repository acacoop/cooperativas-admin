import { Request, Response } from 'express';
import db from '../config/database';
import bcrypt from 'bcryptjs';
import { Cooperative, User } from '../types';

export const activateCooperative = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email, full_name, password } = req.body;
    const adminUserId = (req as any).user.id;

    // Validaciones
    if (!username || !email || !full_name || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar que la cooperativa existe
    const cooperative = await db.get<Cooperative>(
      'SELECT * FROM cooperatives WHERE id = ?',
      [id]
    );

    if (!cooperative) {
      return res.status(404).json({ error: 'Cooperativa no encontrada' });
    }

    // Verificar si ya está activa
    if (cooperative.invoice_system_active === 1) {
      return res.status(400).json({ error: 'La cooperativa ya está activa' });
    }

    // Verificar que el username no esté en uso
    const existingUser = await db.get<User>(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existingUser) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }

    // Verificar que el email no esté en uso
    const existingEmail = await db.get<User>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingEmail) {
      return res.status(400).json({ error: 'El email ya está en uso' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario administrador
    const userResult = await db.run(
      `INSERT INTO users (username, email, password, role, cooperative_id, full_name)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, 'admin_coop', id, full_name]
    );

    const newUserId = userResult.lastID;

    // Activar la cooperativa
    await db.run(
      `UPDATE cooperatives 
       SET invoice_system_active = 1,
           activated_at = datetime('now'),
           activated_by = ?,
           admin_user_id = ?
       WHERE id = ?`,
      [adminUserId, newUserId, id]
    );

    res.json({
      success: true,
      message: 'Cooperativa activada exitosamente',
      data: {
        cooperative_id: id,
        admin_user_id: newUserId,
        username,
        email
      }
    });

  } catch (error: any) {
    console.error('Error activating cooperative:', error);
    res.status(500).json({ error: 'Error al activar cooperativa' });
  }
};

export const deactivateCooperative = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminUserId = (req as any).user.id;

    // Verificar que la cooperativa existe
    const cooperative = await db.get<Cooperative>(
      'SELECT * FROM cooperatives WHERE id = ?',
      [id]
    );

    if (!cooperative) {
      return res.status(404).json({ error: 'Cooperativa no encontrada' });
    }

    // Desactivar la cooperativa
    await db.run(
      `UPDATE cooperatives 
       SET invoice_system_active = 0
       WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Cooperativa desactivada exitosamente'
    });

  } catch (error: any) {
    console.error('Error deactivating cooperative:', error);
    res.status(500).json({ error: 'Error al desactivar cooperativa' });
  }
};

export const getCooperativeActivationStats = async (req: Request, res: Response) => {
  try {
    const stats = await db.get<any>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN invoice_system_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN invoice_system_active = 0 OR invoice_system_active IS NULL THEN 1 ELSE 0 END) as inactive
       FROM cooperatives`
    );

    res.json(stats);

  } catch (error: any) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};
