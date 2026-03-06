// authRoutes.js
import express from 'express';
const router = express.Router();
import authController from '../Controllers/auth.js';
import authMiddleware from '../Middleware/authMiddleware.js';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Kullanıcı kimlik doğrulama işlemleri
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Kullanıcı girişi yapar ve JWT token döndürür
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Başarılı giriş, access token ve refresh token döndürüldü
 *       401:
 *         description: Geçersiz e-posta veya şifre
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Yeni bir kullanıcı kaydeder
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 description: Müşterinin rolü (örn. CUSTOMER, EMPLOYEE)
 *               companyId:
 *                 type: string
 *                 description: Kullanıcının bağlı olduğu şirket ID'si
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla kaydedildi, access token ve refresh token döndürüldü
 *       400:
 *         description: Geçersiz veri veya e-posta zaten kullanımda
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Yeni bir access token almak için kullanılır
 *     tags: [Auth]
 *     security:
 *       - refreshTokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Yeni access token başarıyla oluşturuldu
 *       401:
 *         description: Geçersiz veya süresi dolmuş refresh token
 */
router.post('/refresh', authController.refreshToken);

export default router;