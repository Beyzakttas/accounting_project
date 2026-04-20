import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';

// .env dosyasının tam yolunu belirterek yükleyelim
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * AI Modelini dinamik olarak başlatır
 * (API Key yüklendikten sonra emin olmak için)
 */
const getAiModel = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY .env dosyasında bulunamadı. Lütfen anahtarınızı ekleyin.');
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-flash-latest" });
};

/**
 * Fatura görselinden veri ayıklar (OCR)
 * @param {Buffer} imageBuffer - Görsel verisi
 * @param {string} mimeType - Görsel tipi (image/jpeg, image/png vb.)
 */
export const extractInvoiceData = async (imageBuffer, mimeType) => {
  const prompt = `
    Sen profesyonel bir muhasebe asistanısın. Gönderilen fatura/fiş görselini analiz et ve aşağıdaki bilgileri JSON formatında döndür.
    Sadece JSON döndür, başka açıklama yapma.
    
    Beklenen Alanlar:
    - vendor: Satıcı adı (Örn: Starbucks, Migros)
    - invoiceNumber: Fatura numarası veya Fiş no (Varsa yaz, yoksa null)
    - amount: Toplam tutar (Sadece sayı, Örn: 150.50)
    - date: Fatura tarihi (YYYY-MM-DD formatında)
    - description: Faturanın kısa özeti (Örn: Kahve harcaması)
    - taxAmount: KDV tutarı (Tahmin et veya varsa yaz, yoksa 0)
    - category: Faturanın kategorisi (Sadece şu seçeneklerden biri: 'Yemek', 'Ulaşım', 'Market', 'Teknoloji', 'Ofis', 'Diğer')
    - type: 'EXPENSE' (Eğer faturaysa giderdir)

    Örnek Cevap:
    {
      "vendor": "Starbucks",
      "invoiceNumber": "TR-123456",
      "amount": 45.00,
      "date": "2024-04-20",
      "description": "Filtre Kahve",
      "taxAmount": 4.50,
      "category": "Yemek",
      "type": "EXPENSE"
    }
  `;

  const imageParts = [
    {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType
      },
    },
  ];

  try {
    const model = getAiModel();
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    
    // JSON temizleme (Markdown bloklarını temizle)
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI OCR Hatası:", error);
    
    const errMsg = error.message?.toLowerCase() || '';
    
    // Günlük Kota Aşımı (Daily Quota)
    if (errMsg.includes('quota') && (errMsg.includes('limit') || errMsg.includes('20'))) {
      throw new Error('Günlük yapay zeka kullanım sınırınıza ulaştınız. Lütfen yarın tekrar deneyin veya API anahtarınızı kontrol edin.');
    }
    
    // Hız Sınırı (Rate Limit)
    if (errMsg.includes('429') || errMsg.includes('too many requests')) {
      throw new Error('Yapay zeka sistemi şu an çok yoğun (Hız sınırı). Lütfen 1 dakika bekleyip tekrar deneyin.');
    }
    
    throw new Error(`Fatura analiz edilemedi. Lütfen görselin net olduğundan emin olun.`);
  }
};

/**
 * Finansal verilere dayalı tavsiye ve cevap üretir
 * @param {Object} context - Kullanıcının finansal durumu (toplam gelir, gider vb.)
 * @param {string} userQuestion - Kullanıcının sorusu
 */
export const getFinancialChat = async (context, userQuestion) => {
  const prompt = `
    Sen 'Muhasebe AI' sisteminin akıllı finansal asistanısın. 
    Kullanıcının finansal verilerine (context) sahipsin ancak bunları sadece soruyla ilgiliyse veya kullanıcı durumunu sorarsa paylaşmalısın.
    
    Kullanıcının finansal verileri:
    - Toplam Gelir: ${context.totalIncome} TL
    - Toplam Gider: ${context.totalExpense} TL
    - Net Durum: ${context.totalIncome - context.totalExpense} TL
    - Bekleyen Faturalar: ${context.pendingCount}
    
    Kullanıcının sorusu: "${userQuestion}"
    
    Talimatlar:
    1. Eğer kullanıcı sadece selam verdiyse kısa bir selam ver. Asla bütçe özeti dökme.
    2. Cevapların her zaman çok kısa ve öz olsun. Maksimum 2-3 cümleyi geçme.
    3. Sadece kullanıcı durumunu sorduğunda yukarıdaki context verilerini kullan.
    4. Gereksiz tavsiyelerden kaçın, sadece soruya odaklan.
  `;

  try {
    const model = getAiModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Chat Hatası:", error);
    
    const errMsg = error.message?.toLowerCase() || '';
    
    if (errMsg.includes('quota') && (errMsg.includes('limit') || errMsg.includes('20'))) {
      throw new Error('Günlük asistan kullanım sınırınıza ulaştınız. Lütfen yarın tekrar deneyin.');
    }
    
    if (errMsg.includes('429') || errMsg.includes('too many requests') || errMsg.includes('503')) {
      throw new Error('Asistan şu an çok yoğun, lütfen 1 dakika bekleyip tekrar deneyin.');
    }

    throw new Error(`Asistan teknik bir sorun nedeniyle cevap veremiyor.`);
  }
};
