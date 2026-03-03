import express from 'express';
import dotenv from 'dotenv';
import connectDB from './src/Config/db.js';
import cors from 'cors';

import routes from './src/Routers/index.js'; // Bu otomatik olarak src/Routers/index.js'i çeker

// Yapılandırmayı ve Veritabanını yükle
dotenv.config();
connectDB();

const app = express();

// Middleware'ler
app.use(cors()); // Önce CORS gelmeli
app.use(express.json());

// API Rotalarını Kullan (Burayı ekledik)
app.use('/api', routes); // Artık tüm rotalar /api altından tek merkezden dağıtılıyor

// Test rotası
app.get('/', (req, res) => {
  res.send('Muhasebe Backend Çalışıyor...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Sunucu ${PORT} portunda yayında!`);
});