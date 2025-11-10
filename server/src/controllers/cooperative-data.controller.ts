import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { CostCenterRepository } from '../models/repositories/CostCenterRepository';
import { InvoiceCategoryRepository } from '../models/repositories/InvoiceCategoryRepository';
import { CooperativeRepository } from '../models/repositories/CooperativeRepository';

export class CooperativeDataController {
  private costCenterRepository: CostCenterRepository;
  private invoiceCategoryRepository: InvoiceCategoryRepository;
  private cooperativeRepository: CooperativeRepository;

  constructor() {
    const prisma = new PrismaClient();
    this.costCenterRepository = new CostCenterRepository(prisma);
    this.invoiceCategoryRepository = new InvoiceCategoryRepository(prisma);
    this.cooperativeRepository = new CooperativeRepository(prisma);
  }

  // Get all active cost centers for a specific cooperative
  public getCostCenters = async (req: Request, res: Response): Promise<void> => {
    try {
      const { cooperativeId } = req.params;
      const id = parseInt(cooperativeId);

      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de cooperativa inválido' });
        return;
      }

      // Verify cooperative exists
      const cooperative = await this.cooperativeRepository.findById(id);
      if (!cooperative) {
        res.status(404).json({ error: 'Cooperativa no encontrada' });
        return;
      }

      const costCenters = await this.costCenterRepository.findByCooperative(id);
      
      res.json({
        success: true,
        data: costCenters.map(cc => ({
          id: cc.id,
          name: cc.name,
          description: cc.description
        }))
      });

    } catch (error) {
      console.error('Error getting cost centers:', error);
      res.status(500).json({ error: 'Error al obtener centros de costo' });
    }
  };

  // Get all active categories for a specific cooperative
  public getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const { cooperativeId } = req.params;
      const id = parseInt(cooperativeId);

      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de cooperativa inválido' });
        return;
      }

      // Verify cooperative exists
      const cooperative = await this.cooperativeRepository.findById(id);
      if (!cooperative) {
        res.status(404).json({ error: 'Cooperativa no encontrada' });
        return;
      }

      const categories = await this.invoiceCategoryRepository.findByCooperative(id);
      
      res.json({
        success: true,
        data: categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          color: cat.color
        }))
      });

    } catch (error) {
      console.error('Error getting categories:', error);
      res.status(500).json({ error: 'Error al obtener categorías' });
    }
  };

  // Get both cost centers and categories for a cooperative (useful for invoice upload form)
  public getInvoiceSelectors = async (req: Request, res: Response): Promise<void> => {
    try {
      const { cooperativeId } = req.params;
      const id = parseInt(cooperativeId);

      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de cooperativa inválido' });
        return;
      }

      // Verify cooperative exists
      const cooperative = await this.cooperativeRepository.findById(id);
      if (!cooperative) {
        res.status(404).json({ error: 'Cooperativa no encontrada' });
        return;
      }

      const [costCenters, categories] = await Promise.all([
        this.costCenterRepository.findByCooperative(id),
        this.invoiceCategoryRepository.findByCooperative(id)
      ]);
      
      res.json({
        success: true,
        data: {
          cooperative: {
            id: cooperative.id,
            name: cooperative.name,
            cuit: cooperative.cuit
          },
          costCenters: costCenters.map(cc => ({
            id: cc.id,
            name: cc.name,
            description: cc.description
          })),
          categories: categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            description: cat.description,
            color: cat.color
          }))
        }
      });

    } catch (error) {
      console.error('Error getting invoice selectors:', error);
      res.status(500).json({ error: 'Error al obtener datos para facturación' });
    }
  };

  // Get all active cooperatives (for cooperative selector)
  public getAllCooperatives = async (req: Request, res: Response): Promise<void> => {
    try {
      const cooperatives = await this.cooperativeRepository.findAll();
      
      res.json({
        success: true,
        data: cooperatives
          .filter(coop => coop.status === 'active')
          .map(coop => ({
            id: coop.id,
            name: coop.name,
            cuit: coop.cuit,
            code: coop.code
          }))
          .sort((a, b) => a.name.localeCompare(b.name))
      });

    } catch (error) {
      console.error('Error getting cooperatives:', error);
      res.status(500).json({ error: 'Error al obtener cooperativas' });
    }
  };

  // CRUD operations for Cost Centers (for cooperative admins)
  public createCostCenter = async (req: Request, res: Response): Promise<void> => {
    try {
      const { cooperativeId } = req.params;
      const { name, description } = req.body;
      const userId = (req as any).user.id;
      const userCoopId = (req as any).user.cooperative_id;
      
      const id = parseInt(cooperativeId);

      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de cooperativa inválido' });
        return;
      }

      // Verify user belongs to this cooperative (for admin_coop role)
      if (userCoopId && userCoopId !== id) {
        res.status(403).json({ error: 'No autorizado para esta cooperativa' });
        return;
      }

      if (!name || !name.trim()) {
        res.status(400).json({ error: 'El nombre es requerido' });
        return;
      }

      // Check if name already exists for this cooperative
      const existing = await this.costCenterRepository.findByName(id, name.trim());
      if (existing) {
        res.status(400).json({ error: 'Ya existe un centro de costo con ese nombre' });
        return;
      }

      const costCenter = await this.costCenterRepository.create({
        cooperative: { connect: { id } },
        name: name.trim(),
        description: description?.trim() || null,
        isActive: true
      });

      res.status(201).json({
        success: true,
        message: 'Centro de costo creado exitosamente',
        data: {
          id: costCenter.id,
          name: costCenter.name,
          description: costCenter.description
        }
      });

    } catch (error) {
      console.error('Error creating cost center:', error);
      res.status(500).json({ error: 'Error al crear centro de costo' });
    }
  };

  // CRUD operations for Categories (for cooperative admins)
  public createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { cooperativeId } = req.params;
      const { name, description, color } = req.body;
      const userId = (req as any).user.id;
      const userCoopId = (req as any).user.cooperative_id;
      
      const id = parseInt(cooperativeId);

      if (isNaN(id)) {
        res.status(400).json({ error: 'ID de cooperativa inválido' });
        return;
      }

      // Verify user belongs to this cooperative (for admin_coop role)
      if (userCoopId && userCoopId !== id) {
        res.status(403).json({ error: 'No autorizado para esta cooperativa' });
        return;
      }

      if (!name || !name.trim()) {
        res.status(400).json({ error: 'El nombre es requerido' });
        return;
      }

      // Check if name already exists for this cooperative
      const existing = await this.invoiceCategoryRepository.findByName(id, name.trim());
      if (existing) {
        res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
        return;
      }

      const category = await this.invoiceCategoryRepository.create({
        cooperative: { connect: { id } },
        name: name.trim(),
        description: description?.trim() || null,
        color: color?.trim() || null,
        isActive: true
      });

      res.status(201).json({
        success: true,
        message: 'Categoría creada exitosamente',
        data: {
          id: category.id,
          name: category.name,
          description: category.description,
          color: category.color
        }
      });

    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ error: 'Error al crear categoría' });
    }
  };
}