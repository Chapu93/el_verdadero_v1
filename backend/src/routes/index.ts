import { Router } from 'express';
import authRoutes from './auth.routes.js';
import usersRoutes from './users.routes.js';
import customersRoutes from './customers.routes.js';
import ordersRoutes from './orders.routes.js';
import statsRoutes from './stats.routes.js';
import templatesRoutes from './templates.routes.js';
import pagesRoutes from './pages.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/customers', customersRoutes);
router.use('/orders', ordersRoutes);
router.use('/stats', statsRoutes);
router.use('/templates', templatesRoutes);
router.use('/pages', pagesRoutes);

export default router;

