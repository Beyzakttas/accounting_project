// invoice.js
import express from 'express';
const router = express.Router();
import invoiceController from '../Controllers/invoice.js';
import authMiddleware from '../Middleware/authMiddleware.js';
import roleMiddleware from '../Middleware/roleMiddleware.js';

/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: Fatura işlemleri
 */

/**
 * @swagger
 * /api/invoice:
 *   get:
 *     summary: Tüm faturaları listeler
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Faturalar listelendi
 */
router.get('/', authMiddleware, invoiceController.getAllInvoices);

/**
 * @swagger
 * /api/invoice:
 *   post:
 *     summary: Yeni bir fatura oluşturur
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Invoice'
 *     responses:
 *       201:
 *         description: Fatura oluşturuldu
 */
router.post('/', authMiddleware, roleMiddleware(['ADMİN']), invoiceController.createInvoice);

/**
 * @swagger
 * /api/invoice/{id}:
 *   put:
 *     summary: Mevcut bir faturayı günceller
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Invoice'
 *     responses:
 *       200:
 *         description: Fatura güncellendi
 */
router.put('/:id', authMiddleware, roleMiddleware(['ADMİN']), invoiceController.updateInvoice);

/**
 * @swagger
 * /api/invoice/{id}:
 *   delete:
 *     summary: Bir faturayı siler
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Fatura silindi
 */
router.delete('/:id', authMiddleware, roleMiddleware(['ADMİN']), invoiceController.deleteInvoice);

export default router;