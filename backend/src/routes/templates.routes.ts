import { Router } from 'express';
import * as templatesController from '../controllers/templates.controller.js';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication and ADMIN role
router.use(authMiddleware);
router.use(requireRole('ADMIN'));

router.get('/', templatesController.getAll);
router.get('/:id', templatesController.getById);
router.post('/', templatesController.create);
router.patch('/:id', templatesController.update);
router.delete('/:id', templatesController.remove);

export default router;
