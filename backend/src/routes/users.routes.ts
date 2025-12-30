import { Router } from 'express';
import * as usersController from '../controllers/users.controller.js';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/me', usersController.getMe);
router.patch('/me', usersController.update); // For updating own profile
router.get('/', requireRole('ADMIN'), usersController.getAll);
router.get('/:id', usersController.getById);
router.patch('/:id', usersController.update);

export default router;
