import { Router } from 'express';
import {
  createReservation,
  listReservations,
  occupiedSpaces,
  validateAccess,
  validateFoodDelivery,
} from '../controllers/reservation.controllers.ts';
import { requireAuth, requireRole } from '../middleware/auth.middleware.ts';

const router = Router();

router.use(requireAuth);
router.get('/', requireRole('cliente', 'admin'), listReservations);
router.get('/occupied/:functionId', occupiedSpaces);
router.post('/', requireRole('cliente'), createReservation);
router.patch('/:code/access', requireRole('empleado'), validateAccess);
router.patch('/:code/delivery', requireRole('empleado'), validateFoodDelivery);

export default router;
