import { Router } from 'express';
import { CooperativeDataController } from '../controllers/cooperative-data.controller';
import { authenticateToken, checkRole } from '../middleware/auth.middleware';

/**
 * @swagger
 * tags:
 *   name: Cooperative Data
 *   description: Endpoints para obtener datos de cooperativas, centros de costo y categorías
 */

const router = Router();
const cooperativeDataController = new CooperativeDataController();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /data/cooperatives:
 *   get:
 *     summary: Obtener todas las cooperativas activas
 *     tags: [Cooperative Data]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cooperativas activas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       cuit:
 *                         type: string
 *                       code:
 *                         type: integer
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/cooperatives', cooperativeDataController.getAllCooperatives.bind(cooperativeDataController));

/**
 * @swagger
 * /data/cooperatives/{cooperativeId}/cost-centers:
 *   get:
 *     summary: Obtener centros de costo de una cooperativa
 *     tags: [Cooperative Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cooperativeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cooperativa
 *     responses:
 *       200:
 *         description: Lista de centros de costo activos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *       404:
 *         description: Cooperativa no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/cooperatives/:cooperativeId/cost-centers', cooperativeDataController.getCostCenters.bind(cooperativeDataController));

/**
 * @swagger
 * /data/cooperatives/{cooperativeId}/categories:
 *   get:
 *     summary: Obtener categorías de facturas de una cooperativa
 *     tags: [Cooperative Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cooperativeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cooperativa
 *     responses:
 *       200:
 *         description: Lista de categorías activas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       color:
 *                         type: string
 */
router.get('/cooperatives/:cooperativeId/categories', cooperativeDataController.getCategories.bind(cooperativeDataController));

/**
 * @swagger
 * /data/cooperatives/{cooperativeId}/invoice-selectors:
 *   get:
 *     summary: Obtener todos los datos necesarios para el formulario de carga de facturas
 *     tags: [Cooperative Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cooperativeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cooperativa
 *     responses:
 *       200:
 *         description: Datos completos para formulario de facturas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     cooperative:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         cuit:
 *                           type: string
 *                     costCenters:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CostCenter'
 *                     categories:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/InvoiceCategory'
 */
router.get('/cooperatives/:cooperativeId/invoice-selectors', cooperativeDataController.getInvoiceSelectors.bind(cooperativeDataController));

/**
 * @swagger
 * /data/cooperatives/{cooperativeId}/cost-centers:
 *   post:
 *     summary: Crear un nuevo centro de costo
 *     tags: [Cooperative Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cooperativeId
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
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del centro de costo
 *               description:
 *                 type: string
 *                 description: Descripción del centro de costo
 *     responses:
 *       201:
 *         description: Centro de costo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Datos inválidos o centro de costo ya existe
 *       403:
 *         description: No autorizado para esta cooperativa
 */
router.post('/cooperatives/:cooperativeId/cost-centers', 
  checkRole(['admin_coop', 'admin_aca']), 
  cooperativeDataController.createCostCenter
);

/**
 * @swagger
 * /data/cooperatives/{cooperativeId}/categories:
 *   post:
 *     summary: Crear una nueva categoría de factura
 *     tags: [Cooperative Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cooperativeId
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
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre de la categoría
 *               description:
 *                 type: string
 *                 description: Descripción de la categoría
 *               color:
 *                 type: string
 *                 description: Color en formato hex para la UI
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Datos inválidos o categoría ya existe
 *       403:
 *         description: No autorizado para esta cooperativa
 */
router.post('/cooperatives/:cooperativeId/categories', 
  checkRole(['admin_coop', 'admin_aca']), 
  cooperativeDataController.createCategory
);

export default router;