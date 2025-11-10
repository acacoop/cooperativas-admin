import express from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateToken, checkRole } from '../middleware/auth.middleware';

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Endpoints de administración de cooperativas (solo admin_aca)
 */

const router = express.Router();
const adminController = new AdminController();

// Todas las rutas requieren autenticación y rol admin_aca
router.use(authenticateToken);
router.use(checkRole(['admin_aca']));

/**
 * @swagger
 * /admin/cooperatives/{id}/activate:
 *   post:
 *     summary: Activar cooperativa y crear usuario administrador
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cooperativa a activar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - full_name
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nombre de usuario del administrador
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del administrador
 *               full_name:
 *                 type: string
 *                 description: Nombre completo del administrador
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Contraseña del administrador
 *     responses:
 *       200:
 *         description: Cooperativa activada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     cooperative_id:
 *                       type: integer
 *                     admin_user_id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Datos inválidos o cooperativa ya activa
 *       404:
 *         description: Cooperativa no encontrada
 */
router.post('/cooperatives/:id/activate', adminController.activateCooperative.bind(adminController));

/**
 * @swagger
 * /admin/cooperatives/{id}/deactivate:
 *   post:
 *     summary: Desactivar cooperativa
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cooperativa a desactivar
 *     responses:
 *       200:
 *         description: Cooperativa desactivada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Cooperativa no encontrada
 */
router.post('/cooperatives/:id/deactivate', adminController.deactivateCooperative.bind(adminController));

/**
 * @swagger
 * /admin/cooperatives/stats:
 *   get:
 *     summary: Obtener estadísticas de activación de cooperativas
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de cooperativas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total de cooperativas
 *                 active:
 *                   type: integer
 *                   description: Cooperativas activas
 *                 inactive:
 *                   type: integer
 *                   description: Cooperativas inactivas
 */
router.get('/cooperatives/stats', adminController.getCooperativeActivationStats.bind(adminController));

export default router;
