import { Router } from 'express';
import * as pagesController from '../controllers/pages.controller.js';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Admin routes
router.get('/', pagesController.getAll);
router.get('/:id', pagesController.getById);
router.post('/', requireRole('ADMIN'), pagesController.create);
router.patch('/:id', pagesController.update);
router.delete('/:id', requireRole('ADMIN'), pagesController.remove);

// Publish/Unpublish
router.post('/:id/publish', requireRole('ADMIN'), pagesController.publish);
router.post('/:id/unpublish', requireRole('ADMIN'), pagesController.unpublish);

// Elements
router.get('/:id/elements', pagesController.getElements);
router.patch('/:id/elements/:elementKey', pagesController.updateElement);

export default router;
