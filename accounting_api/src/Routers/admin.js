import express from 'express';
const router = express.Router();
import adminController from '../Controllers/admin.js';
import authMiddleware from '../Middleware/authMiddleware.js';
import roleMiddleware from '../Middleware/roleMiddleware.js';

// Super Admin Routes - Only completely accessible by 'ADMİN'
router.post('/company', authMiddleware, roleMiddleware(['ADMİN']), adminController.createCompanyWithOwner);
router.put('/company/:id', authMiddleware, roleMiddleware(['ADMİN']), adminController.updateCompanyQuota);
router.get('/company', authMiddleware, roleMiddleware(['ADMİN']), adminController.getAllCompanies);

export default router;
