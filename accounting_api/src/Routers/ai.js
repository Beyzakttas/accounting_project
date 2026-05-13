import express from 'express';
import multer from 'multer';
import * as aiController from '../Controllers/ai.js';
import authMiddleware from '../Middleware/authMiddleware.js';

const router = express.Router();

// Multer yapılandırması (Dosyayı bellekte tutalım)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Tüm AI rotaları için yetkilendirme gerekir
router.use(authMiddleware);

/**
 * @swagger
 * /api/ai/ocr:
 *   post:
 *     summary: Faturadan veri ayıklar
 *     tags: [AI]
 */
router.post('/ocr', upload.single('invoice'), aiController.processInvoiceOCR);

/**
 * @swagger
 * /api/ai/ocr-text:
 *   post:
 *     summary: İstemci tarafında ayıklanmış faturadan (metin üzerinden) veri ayıklar
 *     tags: [AI]
 */
router.post('/ocr-text', aiController.processInvoiceOCRText);

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Finansal asistanla konuşur
 *     tags: [AI]
 */
router.post('/chat', aiController.chatWithAI);

export default router;
