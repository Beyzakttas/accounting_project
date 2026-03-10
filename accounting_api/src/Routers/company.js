import express from 'express';
const router = express.Router();
import adminController from '../Controllers/admin.js';
import authMiddleware from '../Middleware/authMiddleware.js';
import roleMiddleware from '../Middleware/roleMiddleware.js';

/**
 * @swagger
 * tags:
 *   name: Company
 *   description: İşletme / Şirket yönetim rotaları (Sadece Super Admin)
 */

/**
 * @swagger
 * /api/company:
 *   post:
 *     summary: Yeni bir şirket ve o şirkete ait yönetici (Owner) oluşturur
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - taxNumber
 *               - phone
 *               - email
 *               - ownerFullname
 *               - ownerEmail
 *               - ownerPassword
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               taxNumber:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               ownerFullname:
 *                 type: string
 *               ownerEmail:
 *                 type: string
 *               ownerPassword:
 *                 type: string
 *               quota:
 *                 type: number
 *                 description: Şirket fatura/kullanıcı kotası
 *     responses:
 *       201:
 *         description: Şirket başarıyla oluşturuldu
 *       400:
 *         description: Şirket veya kullanıcı email adresi zaten mevcut
 */
router.post('/', authMiddleware, roleMiddleware(['ADMİN', 'MANAGER']), adminController.createCompanyWithOwner);

/**
 * @swagger
 * /api/company/my-company:
 *   get:
 *     summary: Giriş yapmış yöneticinin bağlı olduğu kendi şirketinin bilgilerini getirir.
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Şirket bilgileri başarılı şekilde getirildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       403:
 *         description: Herhangi bir şirkete bağlı değilsiniz
 *       404:
 *         description: Şirket bulunamadı
 */
import companyController from '../Controllers/company.js';
router.get('/my-company', authMiddleware, roleMiddleware(['MANAGER']), companyController.getMyCompany);

/**
 * @swagger
 * /api/company/{id}:
 *   put:
 *     summary: Şirket kotasını ve abonelik bilgilerini günceller
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Şirket ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Company'
 *     responses:
 *       200:
 *         description: Şirket başarıyla güncellendi
 *       404:
 *         description: Şirket bulunamadı
 */
router.put('/:id', authMiddleware, roleMiddleware(['ADMİN']), adminController.updateCompanyQuota);

/**
 * @swagger
 * /api/company:
 *   get:
 *     summary: Sistemdeki tüm şirketleri listeler
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Başarılı liste döndürüldü
 */
router.get('/', authMiddleware, roleMiddleware(['ADMİN']), adminController.getAllCompanies);

export default router;
