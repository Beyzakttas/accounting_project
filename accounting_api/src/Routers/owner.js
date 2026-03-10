import express from 'express';
const router = express.Router();
import ownerController from '../Controllers/owner.js';
import authMiddleware from '../Middleware/authMiddleware.js';
import roleMiddleware from '../Middleware/roleMiddleware.js';

/**
 * @swagger
 * tags:
 *   name: Owner
 *   description: Şirket yöneticisi (MANAGER) işlemleri
 */

/**
 * @swagger
 * /api/owner/staff:
 *   post:
 *     summary: Şirkete yeni bir personel (USER) ekler
 *     tags: [Owner]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Personel başarıyla eklendi
 *       400:
 *         description: Kota dolu veya email kullanımda
 */
router.post('/staff', authMiddleware, roleMiddleware(['MANAGER']), ownerController.createStaff);

/**
 * @swagger
 * /api/owner/staff:
 *   get:
 *     summary: Şirketteki tüm personelleri listeler
 *     tags: [Owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Personel listesi döndürüldü
 */
router.get('/staff', authMiddleware, roleMiddleware(['MANAGER']), ownerController.getCompanyStaff);

/**
 * @swagger
 * /api/owner/invoices:
 *   get:
 *     summary: Şirkete ait tüm faturaları listeler
 *     tags: [Owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fatura listesi döndürüldü
 */
router.get('/invoices', authMiddleware, roleMiddleware(['MANAGER']), ownerController.getCompanyInvoices);

/**
 * @swagger
 * /api/owner/settings:
 *   put:
 *     summary: Şirket ayarlarını günceller
 *     tags: [Owner]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               settings:
 *                 type: object
 *                 description: Güncellenecek ayarlar JSON nesnesi
 *     responses:
 *       200:
 *         description: Ayarlar başarıyla güncellendi
 */
router.put('/settings', authMiddleware, roleMiddleware(['MANAGER']), ownerController.updateSettings);

/**
 * @swagger
 * /api/owner/categories:
 *   post:
 *     summary: Şirket için yeni bir fatura kategorisi oluşturur
 *     tags: [Owner]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       201:
 *         description: Kategori başarıyla oluşturuldu
 */
router.post('/categories', authMiddleware, roleMiddleware(['MANAGER']), ownerController.createCategory);

/**
 * @swagger
 * /api/owner/categories:
 *   get:
 *     summary: Şirketin fatura kategorilerini listeler
 *     tags: [Owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kategoriler listelendi
 */
router.get('/categories', authMiddleware, roleMiddleware(['MANAGER', 'USER']), ownerController.getCategories);

export default router;
