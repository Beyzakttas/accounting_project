import mongoose from 'mongoose';

const MAX_RETRIES = 5;

const connectDB = async (retryCount = 0) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Bağlantısı Başarılı: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Bağlantı Hatası: ${error.message}`);

    if (retryCount < MAX_RETRIES) {
      const delay = Math.min(1000 * 2 ** retryCount, 30000); // 1s, 2s, 4s, 8s, 16s (max 30s)
      console.log(`🔄 Yeniden bağlanma deneniyor... (${retryCount + 1}/${MAX_RETRIES}) - ${delay / 1000}s sonra`);
      await new Promise((res) => setTimeout(res, delay));
      return connectDB(retryCount + 1);
    }

    console.error(`💀 ${MAX_RETRIES} deneme sonrası MongoDB'ye bağlanılamadı. Sunucu durduruluyor.`);
    process.exit(1);
  }
};

// Bağlantı durumu olaylarını izle
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB bağlantısı kesildi!');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB bağlantısı yeniden kuruldu!');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB bağlantı hatası: ${err.message}`);
});

export default connectDB;