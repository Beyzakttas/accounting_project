import express from 'express';
const router = express.Router();
import ownerController from '../Controllers/owner.js';
import authMiddleware from '../Middleware/authMiddleware.js';
import roleMiddleware from '../Middleware/roleMiddleware.js';

// Owner Routes - Accessible by 'MANAGER'
router.post('/staff', authMiddleware, roleMiddleware(['MANAGER']), ownerController.createStaff);
router.get('/staff', authMiddleware, roleMiddleware(['MANAGER']), ownerController.getCompanyStaff);
router.get('/invoices', authMiddleware, roleMiddleware(['MANAGER']), ownerController.getCompanyInvoices);
router.put('/settings', authMiddleware, roleMiddleware(['MANAGER']), ownerController.updateSettings);
router.post('/categories', authMiddleware, roleMiddleware(['MANAGER']), ownerController.createCategory);
router.get('/categories', authMiddleware, roleMiddleware(['MANAGER', 'USER']), ownerController.getCategories);

export default router;
