import { Router } from 'express';
import { CooperativeController } from '../controllers/cooperative.controller';
import { authenticateToken, checkRole } from '../middleware/auth.middleware';

/**
 * @swagger
 * tags:
 *   name: Cooperatives
 *   description: Gestión de información de cooperativas
 */

const router = Router();
const cooperativeController = new CooperativeController();

router.use(authenticateToken);

/**
 * @swagger
 * /cooperatives:
 *   get:
 *     summary: Obtener lista de cooperativas
 *     tags: [Cooperatives]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cooperativas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cooperative'
 */
router.get('/', cooperativeController.getAll.bind(cooperativeController));

/**
 * @swagger
 * /cooperatives/{id}:
 *   get:
 *     summary: Obtener cooperativa por ID
 *     tags: [Cooperatives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cooperativa
 *     responses:
 *       200:
 *         description: Detalles de la cooperativa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cooperative'
 *       404:
 *         description: Cooperativa no encontrada
 */
router.get('/:id', cooperativeController.getById.bind(cooperativeController));

/**
 * @swagger
 * /cooperatives/{id}:
 *   put:
 *     summary: Actualizar cooperativa
 *     tags: [Cooperatives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cooperativa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre de la cooperativa
 *               address:
 *                 type: string
 *                 description: Dirección
 *               phone:
 *                 type: string
 *                 description: Teléfono
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email de contacto
 *               contact_person:
 *                 type: string
 *                 description: Persona de contacto
 *               notes:
 *                 type: string
 *                 description: Notas adicionales
 *     responses:
 *       200:
 *         description: Cooperativa actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cooperative'
 *       404:
 *         description: Cooperativa no encontrada
 */
router.put('/:id', cooperativeController.update.bind(cooperativeController));

/**
 * @swagger
 * /cooperatives/pending-changes:
 *   get:
 *     summary: Obtener cambios pendientes de cooperativas (solo admin ACA)
 *     tags: [Cooperatives]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cambios pendientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   cooperative_id:
 *                     type: integer
 *                   change_type:
 *                     type: string
 *                   old_data:
 *                     type: object
 *                   new_data:
 *                     type: object
 *                   requested_by:
 *                     type: integer
 *                   requested_at:
 *                     type: string
 *                     format: date-time
 *                   status:
 *                     type: string
 *                     enum: [pending, approved, rejected]
 *       403:
 *         description: Acceso denegado - solo admin ACA
 */
router.get('/pending-changes', checkRole(['admin_aca']), cooperativeController.getPendingChanges.bind(cooperativeController));

/**
 * @swagger
 * /cooperatives/pending-changes/{id}/{action}:
 *   put:
 *     summary: Responder a cambio pendiente (solo admin ACA)
 *     tags: [Cooperatives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cambio pendiente
 *       - in: path
 *         name: action
 *         required: true
 *         schema:
 *           type: string
 *           enum: [approve, reject]
 *         description: Acción a realizar
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 description: Notas sobre la decisión
 *     responses:
 *       200:
 *         description: Cambio procesado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       403:
 *         description: Acceso denegado - solo admin ACA
 *       404:
 *         description: Cambio pendiente no encontrado
 */
router.put('/pending-changes/:id/:action', checkRole(['admin_aca']), cooperativeController.respondToChange.bind(cooperativeController));

export default router;
