import express from 'express';
import ownerController from '../Controllers/owner.js';
import authMiddleware from '../Middleware/authMiddleware.js';
import roleMiddleware from '../Middleware/roleMiddleware.js';
import validate from '../Middleware/validateMiddleware.js';
import { createStaffSchema } from '../Utils/validators.js';

const router = express.Router();

router.use(authMiddleware);

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
router.post('/staff', roleMiddleware(['ADMIN', 'MANAGER']), validate(createStaffSchema), ownerController.createStaff);

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
router.get('/staff', roleMiddleware(['ADMIN', 'MANAGER']), ownerController.getCompanyStaff);

/**
 * @swagger
 * /api/owner/staff/{id}:
 *   put:
 *     summary: Personel bilgilerini günceller
 *     tags: [Owner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Güncelleme başarılı
 */
router.put('/staff/:id', roleMiddleware(['ADMIN', 'MANAGER']), ownerController.updateStaff);

/**
 * @swagger
 * /api/owner/staff/{id}:
 *   delete:
 *     summary: Personel hesabını siler
 *     tags: [Owner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Silme başarılı
 */
router.delete('/staff/:id', roleMiddleware(['ADMIN', 'MANAGER']), ownerController.deleteStaff);

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
router.get('/invoices', roleMiddleware(['ADMIN', 'MANAGER', 'USER']), ownerController.getCompanyInvoices);

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
router.put('/settings', roleMiddleware(['ADMIN', 'MANAGER']), ownerController.updateSettings);

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
router.post('/categories', roleMiddleware(['ADMIN', 'MANAGER']), ownerController.createCategory);

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
router.get('/categories', roleMiddleware(['ADMIN', 'MANAGER', 'USER']), ownerController.getCategories);

export default router;
