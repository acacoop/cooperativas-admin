import express from 'express';
import { 
  activateCooperative, 
  deactivateCooperative,
  getCooperativeActivationStats 
} from '../controllers/admin.controller';
import { authenticateToken, checkRole } from '../middleware/auth.middleware';

const router = express.Router();

// Todas las rutas requieren autenticación y rol admin_aca
router.use(authenticateToken);
router.use(checkRole(['admin_aca']));

// Activar cooperativa y crear admin
router.post('/cooperatives/:id/activate', activateCooperative);

// Desactivar cooperativa
router.post('/cooperatives/:id/deactivate', deactivateCooperative);

// Obtener estadísticas
router.get('/cooperatives/stats', getCooperativeActivationStats);

export default router;
