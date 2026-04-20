import express from 'express';
const router = express.Router();

import authRoutes from './auth.js';
import companyRoutes from './company.js';
import ownerRoutes from './owner.js';
import invoiceRoutes from './invoice.js';
import categoryRoutes from './category.js';
import aiRoutes from './ai.js';
import authMiddleware from '../Middleware/authMiddleware.js';

// Tüm rotaları tek bir merkezden dağıtalım
router.use('/auth', authRoutes);

router.use(authMiddleware)

router.use('/company', companyRoutes);
router.use('/owner', ownerRoutes);
router.use('/invoice', invoiceRoutes);
router.use('/category', categoryRoutes);
router.use('/ai', aiRoutes);


export default router;