import { Router } from 'express';
import { currentUser, login, register } from '../controllers/auth.controllers.ts';
import { requireAuth } from '../middleware/auth.middleware.ts';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, currentUser);

export default router;
