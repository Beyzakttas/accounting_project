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
    if (result && result.category && req.user && req.user.companyId) {
      const category = await Category.findOne({
        companyId: req.user.companyId,
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
    const { question } = req.body;
    const { _id: userId, companyId } = req.user;

    if (!question) {
      return res.status(400).json({ success: false, message: 'Lütfen bir soru sorun.' });
    }

    if (!companyId) {
      // Eğer şirket ID yoksa (örneğin admin), boş istatistiklerle devam et veya hata döndür
      const emptyStats = { totalIncome: 0, totalExpense: 0, pendingCount: 0 };
      const answer = await aiService.getFinancialChat(emptyStats, question);
      return res.status(200).json({ success: true, data: answer });
    }

    // Kullanıcının güncel finansal durumunu al
    const stats = await invoiceService.getInvoiceStats(companyId);

    const answer = await aiService.getFinancialChat(stats, question);

    res.status(200).json({
      success: true,
      data: answer
    });
  } catch (error) {
    console.error('AI Chat Hatası (Controller):', error);
    next(error);
  }
};
