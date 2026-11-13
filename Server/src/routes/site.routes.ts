import { Router } from 'express';
import {
  createFood,
  createMovie,
  createScreening,
  deleteFood,
  deleteMovie,
  deleteScreening,
  getSiteData,
  updateFood,
  updateMovie,
  updateParkingSpace,
  updateScreening,
} from '../controllers/site.controllers.ts';
import { requireAuth, requireRole } from '../middleware/auth.middleware.ts';

const router = Router();

router.get('/', getSiteData);
router.use(requireAuth, requireRole('admin'));
router.post('/movies', createMovie);
router.put('/movies/:id', updateMovie);
router.delete('/movies/:id', deleteMovie);
router.post('/functions', createScreening);
router.put('/functions/:id', updateScreening);
router.delete('/functions/:id', deleteScreening);
router.post('/foods', createFood);
router.put('/foods/:id', updateFood);
router.delete('/foods/:id', deleteFood);
router.patch('/parking/:id', updateParkingSpace);

export default router;
