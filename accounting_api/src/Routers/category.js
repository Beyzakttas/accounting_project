// categoryRouter.js
import express from 'express';
import authMiddleware from '../Middleware/authMiddleware.js';
import Category from '../Models/Category.js';
import { successResponse } from '../Utils/apiResponse.js';

const router = express.Router();
router.use(authMiddleware);

// GET /api/category - Tüm kategorileri listele
router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return successResponse(res, categories);
  } catch (error) {
    next(error);
  }
});

// POST /api/category - Yeni kategori oluştur
router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      const err = new Error('Kategori adı zorunludur.');
      err.statusCode = 400;
      throw err;
    }
    const category = await Category.create({ name });
    return successResponse(res, category, 'Kategori oluşturuldu.', 201);
  } catch (error) {
    next(error);
  }
});

export default router;
