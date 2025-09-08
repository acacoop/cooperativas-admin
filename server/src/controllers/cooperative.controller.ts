import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import db from '../config/database';
import { Cooperative, PendingChange } from '../types';

export class CooperativeController {
  public async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      let query = 'SELECT * FROM cooperatives WHERE status = "active"';
      let params: any[] = [];

      if (req.user?.role === 'admin_coop') {
        query += ' AND id = ?';
        params.push(req.user.cooperative_id);
      }

      const cooperatives = await db.all<Cooperative>(query, params);
      res.json(cooperatives);
    } catch (error) {
      console.error('Get cooperatives error:', error);
      res.status(500).json({ error: 'Error al obtener cooperativas' });
    }
  }

  public async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (req.user?.role === 'admin_coop' && req.user.cooperative_id !== Number(id)) {
        res.status(403).json({ error: 'Sin permisos para ver esta cooperativa' });
        return;
      }

      const cooperative = await db.get<Cooperative>(
        'SELECT * FROM cooperatives WHERE id = ?',
        [id]
      );

      if (!cooperative) {
        res.status(404).json({ error: 'Cooperativa no encontrada' });
        return;
      }

      res.json(cooperative);
    } catch (error) {
      console.error('Get cooperative error:', error);
      res.status(500).json({ error: 'Error del servidor' });
    }
  }

  public async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const changes = req.body;

      if (req.user?.role === 'admin_coop' && req.user.cooperative_id !== Number(id)) {
        res.status(403).json({ error: 'Sin permisos para editar esta cooperativa' });
        return;
      }

      if (req.user?.role === 'admin_coop') {
        // Create change request
        const result = await db.run(
          'INSERT INTO pending_changes (cooperative_id, user_id, changes) VALUES (?, ?, ?)',
          [id, req.user.id, JSON.stringify(changes)]
        );

        res.json({
          message: 'Solicitud de cambio enviada para aprobación',
          change_id: result.lastID
        });
      } else {
        // Direct update for admin
        const fields = Object.keys(changes).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(changes), id];

        await db.run(
          `UPDATE cooperatives SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          values
        );

        res.json({ message: 'Cooperativa actualizada exitosamente' });
      }
    } catch (error) {
      console.error('Update cooperative error:', error);
      res.status(500).json({ error: 'Error al actualizar cooperativa' });
    }
  }

  public async getPendingChanges(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.user?.role !== 'admin_aca') {
        res.status(403).json({ error: 'Sin permisos' });
        return;
      }

      const changes = await db.all<PendingChange & { cooperative_name: string; username: string }>(`
        SELECT pc.*, c.name as cooperative_name, u.username 
        FROM pending_changes pc
        JOIN cooperatives c ON pc.cooperative_id = c.id
        JOIN users u ON pc.user_id = u.id
        WHERE pc.status = 'pending'
        ORDER BY pc.created_at DESC
      `);

      res.json(changes);
    } catch (error) {
      console.error('Get pending changes error:', error);
      res.status(500).json({ error: 'Error al obtener cambios pendientes' });
    }
  }

  public async respondToChange(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.user?.role !== 'admin_aca') {
        res.status(403).json({ error: 'Sin permisos' });
        return;
      }

      const { id, action } = req.params;

      if (!['approve', 'reject'].includes(action)) {
        res.status(400).json({ error: 'Acción inválida' });
        return;
      }

      const status = action === 'approve' ? 'approved' : 'rejected';
      const change = await db.get<PendingChange>(
        'SELECT * FROM pending_changes WHERE id = ?',
        [id]
      );

      if (!change) {
        res.status(404).json({ error: 'Cambio no encontrado' });
        return;
      }

      if (action === 'approve') {
        const changes = JSON.parse(change.changes);
        const fields = Object.keys(changes).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(changes), change.cooperative_id];

        await db.run(
          `UPDATE cooperatives SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          values
        );
      }

      await db.run(
        'UPDATE pending_changes SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, req.user.id, id]
      );

      res.json({
        message: action === 'approve' ? 'Cambios aprobados y aplicados' : 'Cambios rechazados'
      });
    } catch (error) {
      console.error('Respond to change error:', error);
      res.status(500).json({ error: 'Error al procesar el cambio' });
    }
  }
}
