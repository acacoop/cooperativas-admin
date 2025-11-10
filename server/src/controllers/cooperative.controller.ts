import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PrismaClient } from '../generated/prisma';
import { CooperativeRepository } from '../models/repositories/CooperativeRepository';
import { PendingChangeRepository } from '../models/repositories/PendingChangeRepository';


export class CooperativeController {

  private cooperativeRepository: CooperativeRepository;
  private pendingChangeRepository: PendingChangeRepository;

  constructor() {
    const prisma = new PrismaClient();
    this.cooperativeRepository = new CooperativeRepository(prisma);
    this.pendingChangeRepository = new PendingChangeRepository(prisma);
  }

  public async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      let whereClause: any = { status: "active" };

      // If admin_coop, only show their cooperative
      if (req.user?.role === 'admin_coop') {
        whereClause.id = req.user.cooperative_id;
      }

      const cooperatives = await this.cooperativeRepository.findAll({
        where: whereClause
      });

      if(!cooperatives || cooperatives.length === 0) {
        res.status(404).json({ error: 'No se encontraron cooperativas' });
        return;
      }

      res.status(200).json(cooperatives);
    } catch (error) {
      console.error('Get cooperatives error:', error);
      res.status(500).json({ error: 'Error al obtener cooperativas' });
    }
  }

  public async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Check permissions for admin_coop
      if (req.user?.role === 'admin_coop' && req.user.cooperative_id !== Number(id)) {
        res.status(403).json({ error: 'Sin permisos para ver esta cooperativa' });
        return;
      }

      const cooperative = await this.cooperativeRepository.findById(Number(id));

      if (!cooperative) {
        res.status(404).json({ error: 'Cooperativa no encontrada' });
        return;
      }

      res.status(200).json(cooperative);
    } catch (error) {
      console.error('Get cooperative error:', error);
      res.status(500).json({ error: 'Error del servidor' });
    }
  }

  public async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const changes = req.body;

      // Check permissions for admin_coop
      if (req.user?.role === 'admin_coop' && req.user.cooperative_id !== Number(id)) {
        res.status(403).json({ error: 'Sin permisos para editar esta cooperativa' });
        return;
      }

      if (req.user?.role === 'admin_coop') {
        // Create pending change request using repository
        const result = await this.pendingChangeRepository.create(
          Number(id), 
          req.user.id!, 
          changes
        );

        res.status(200).json({
          message: 'Solicitud de cambio enviada para aprobación',
          change_id: result.id
        });
      } else {
        // Direct update for admin using repository
        const updatedCooperative = await this.cooperativeRepository.update(Number(id), changes);
        res.status(200).json({ 
          message: 'Cooperativa actualizada exitosamente',
          cooperative: updatedCooperative
        });
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

      const changes = await this.pendingChangeRepository.findAllPending();
      res.status(200).json(changes);
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
      const change = await this.pendingChangeRepository.findById(Number(id));

      if (!change) {
        res.status(404).json({ error: 'Cambio no encontrado' });
        return;
      }

      if (action === 'approve') {
        const changes = JSON.parse(change.changes);
        await this.cooperativeRepository.update(change.cooperativeId, changes);
      }

      await this.pendingChangeRepository.updateStatus(Number(id), status, req.user.id!);

      res.status(200).json({
        message: action === 'approve' ? 'Cambios aprobados y aplicados' : 'Cambios rechazados'
      });
    } catch (error) {
      console.error('Respond to change error:', error);
      res.status(500).json({ error: 'Error al procesar el cambio' });
    }
  }
}
