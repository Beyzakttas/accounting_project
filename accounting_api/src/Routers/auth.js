// authRoutes.js
import express from 'express';
const router = express.Router();
import authController from '../Controllers/auth.js';
import authMiddleware from '../Middleware/authMiddleware.js';

// Authentication routes
router.post('/login', authController.login);
router.post('/register', authController.register);
export default router;