// invoice.js
import express from 'express';
const router = express.Router();
import invoiceController from '../Controllers/invoice.js';
import authMiddleware from '../Middleware/authMiddleware.js';
import roleMiddleware from '../Middleware/roleMiddleware.js';

// Invoice routes
router.get('/', authMiddleware, invoiceController.getAllInvoices);
router.post('/', authMiddleware, roleMiddleware(['ADMİN']), invoiceController.createInvoice);
router.put('/:id', authMiddleware, roleMiddleware(['ADMİN']), invoiceController.updateInvoice);
router.delete('/:id', authMiddleware, roleMiddleware(['ADMİN']), invoiceController.deleteInvoice);

export default router;