import dotenv from 'dotenv';
import path from 'path';

// .env dosyasını en başta ve tam yol belirterek yükleyelim
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import express from 'express';
import connectDB from './src/Config/db.js';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import routes from './src/Routers/index.js'; // Bu otomatik olarak src/Routers/index.js'i çeker
import { setupSwagger } from './src/Config/swagger.js';
import errorMiddleware from './src/Middleware/errorMiddleware.js';

// Yapılandırmayı ve Veritabanını yükle
connectDB();

const app = express();

// Middleware'ler
app.use(cors()); // En başta olmalı
app.use(helmet()); // Güvenlik başlıklarını ayarlar
app.use('/uploads', express.static('uploads')); // Statik dosya erişimi

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 1000, // Geliştirme için sınırı yükselttik (Normalde 100)
  message: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.'
});
app.use('/api', limiter); // Sadece API rotaları için sınırlama

app.use(express.json());

// API Rotalarını Kullan (Burayı ekledik)
app.use('/api', routes); // Artık tüm rotalar /api altından tek merkezden dağıtılıyor

// Hata Yönetimi Middleware'i (En sonda olmalı)
app.use(errorMiddleware);

// Test rotası
app.get('/', (req, res) => {
  res.send('Muhasebe Backend Çalışıyor...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Sunucu ${PORT} portunda yayında!`);
  setupSwagger(app, PORT);
});