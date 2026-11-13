import { Router } from 'express';
import {
  createEmployee,
  deleteVehicle,
  listEmployees,
  listVehicles,
  saveVehicle,
  updateProfile,
} from '../controllers/account.controllers.ts';
import { requireAuth, requireRole } from '../middleware/auth.middleware.ts';

const router = Router();

router.use(requireAuth);
router.patch('/me', requireRole('cliente'), updateProfile);
router.get('/me/vehicles', requireRole('cliente'), listVehicles);
router.post('/me/vehicles', requireRole('cliente'), saveVehicle);
router.put('/me/vehicles/:id', requireRole('cliente'), saveVehicle);
router.delete('/me/vehicles/:id', requireRole('cliente'), deleteVehicle);
router.get('/employees', requireRole('admin'), listEmployees);
router.post('/employees', requireRole('admin'), createEmployee);

export default router;
