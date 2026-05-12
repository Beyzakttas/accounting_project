import * as aiService from '../Services/aiService.js';
import * as invoiceService from '../Services/invoiceService.js';
import Category from '../Models/Category.js';

/**
 * Fatura OCR işlemi (Görselden veri çıkarma)
 */
export const processInvoiceOCR = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Lütfen bir fatura görseli yükleyin.' });
    }

    const result = await aiService.extractInvoiceData(req.file.buffer, req.file.mimetype);

    // Kategori eşleştirme mantığı
    if (result && result.category) {
      const category = await Category.findOne({
        name: { $regex: new RegExp(`^${result.category}$`, 'i') } // Case-insensitive eşleşme
      });

      if (category) {
        result.category = category._id;
      }
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Finansal Asistan Sohbeti
 */
export const chatWithAI = async (req, res, next) => {
  try {
    const { question, language } = req.body;
    const { _id: userId, role, department } = req.user;

    if (!question) {
      return res.status(400).json({ success: false, message: 'Lütfen bir soru sorun.' });
    }

    // Kullanıcının güncel finansal durumunu al (şirket filtresi olmadan)
    const stats = await invoiceService.getInvoiceStats(userId, role, department);

    const answer = await aiService.getFinancialChat(stats, question, language || 'tr');

    res.status(200).json({
      success: true,
      data: answer
    });
  } catch (error) {
    console.error('AI Chat Hatası (Controller):', error);
    next(error);
  }
};
