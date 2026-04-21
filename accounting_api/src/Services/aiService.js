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
 * Groq AI (Llama) API çağrısını gerçekleştirir (Yedek Servis)
 * @param {string} prompt - Metin komutu
 * @param {Buffer} imageBuffer - (Opsiyonel) Görsel verisi
 * @param {string} mimeType - (Opsiyonel) Görsel tipi
 * @param {boolean} isJson - JSON formatında mı dönecek?
 */
const callGroqLlama = async (prompt, imageBuffer = null, mimeType = null, isJson = true) => {
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || "llama-3.2-11b-vision-preview";

    if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY_HERE') {
        throw new Error('Llama yedeği için anahtar bulunamadı (GROQ_API_KEY).');
    }

    const messages = [
        {
            role: "user",
            content: [
                { type: "text", text: prompt }
            ]
        }
    ];

    // Eğer görsel varsa içeriğe ekle (Llama 3.2 Vision desteği)
    if (imageBuffer) {
        messages[0].content.push({
            type: "image_url",
            image_url: {
                url: `data:${mimeType};base64,${imageBuffer.toString("base64")}`
            }
        });
    }

    const payload = {
        model,
        messages,
        temperature: 0.1,
        max_tokens: 1024
    };

    if (isJson) {
        payload.response_format = { type: "json_object" };
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(`Groq API Hatası: ${errData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
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

  try {
    // 1. Önce Gemini'yi dene
    const model = getAiModel();
    const imageParts = [{ inlineData: { data: imageBuffer.toString("base64"), mimeType } }];
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);

  } catch (error) {
    const errMsg = error.message?.toLowerCase() || '';
    
    // Kota veya Hız Sınırı Hatası Alındıysa Llama'ya Geç
    if (errMsg.includes('quota') || errMsg.includes('429') || errMsg.includes('limit') || errMsg.includes('too many requests')) {
      console.warn("Gemini limiti doldu, Llama (Groq) yedeği devreye giriyor...");
      try {
          const llamaText = await callGroqLlama(prompt, imageBuffer, mimeType, true);
          return JSON.parse(llamaText);
      } catch (llamaError) {
          console.error("Llama yedeği de başarısız:", llamaError);
          throw new Error('Yapay zeka servislerinin tümü şu an meşgul. Lütfen biraz bekleyip tekrar deneyin.');
      }
    }
    
    console.error("AI OCR Hatası:", error);
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
    // 1. Önce Gemini'yi dene
    const model = getAiModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    const errMsg = error.message?.toLowerCase() || '';

    // Kota hatası varsa Llama'ya geç
    if (errMsg.includes('quota') || errMsg.includes('429') || errMsg.includes('limit')) {
        console.warn("Asistan yedeği (Llama) devreye giriyor...");
        try {
            return await callGroqLlama(prompt, null, null, false);
        } catch (llamaError) {
            console.error("Llama sohbet yedeği başarısız:", llamaError);
            throw new Error('Asistan şu an çok yoğun, lütfen 1 dakika bekleyip tekrar deneyin.');
        }
    }

    console.error("AI Chat Hatası:", error);
    throw new Error(`Asistan teknik bir sorun nedeniyle cevap veremiyor.`);
  }
};

