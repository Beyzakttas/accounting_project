import express from 'express';
const router = express.Router();

import authRoutes from './auth.js';
import companyRoutes from './company.js';
import ownerRoutes from './owner.js';
import invoiceRoutes from './invoice.js';

// Tüm rotaları tek bir merkezden dağıtalım
router.use('/auth', authRoutes);
router.use('/company', companyRoutes);
router.use('/owner', ownerRoutes);
router.use('/invoice', invoiceRoutes);

export default router;