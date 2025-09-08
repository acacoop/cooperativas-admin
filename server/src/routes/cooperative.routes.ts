import { Router } from 'express';
import { CooperativeController } from '../controllers/cooperative.controller';
import { authenticateToken, checkRole } from '../middleware/auth.middleware';

const router = Router();
const cooperativeController = new CooperativeController();

router.get('/', authenticateToken, cooperativeController.getAll);
router.get('/:id', authenticateToken, cooperativeController.getById);
router.put('/:id', authenticateToken, cooperativeController.update);

router.get('/pending-changes', authenticateToken, checkRole(['admin_aca']), cooperativeController.getPendingChanges);
router.put('/pending-changes/:id/:action', authenticateToken, checkRole(['admin_aca']), cooperativeController.respondToChange);

export default router;
