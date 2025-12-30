import { Router } from 'express';
import * as ordersController from '../controllers/orders.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', ordersController.getAll);
router.get('/:id', ordersController.getById);
router.post('/', ordersController.create);
router.patch('/:id', ordersController.update);
router.delete('/:id', ordersController.remove);

export default router;
