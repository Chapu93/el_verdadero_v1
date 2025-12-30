import { Router } from 'express';
import * as customersController from '../controllers/customers.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', customersController.getAll);
router.get('/:id', customersController.getById);
router.post('/', customersController.create);
router.patch('/:id', customersController.update);
router.delete('/:id', customersController.remove);

export default router;
