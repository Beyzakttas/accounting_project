import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';

// .env dosyasının tam yolunu belirterek yükleyelim
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * AI Modelini dinamik olarak başlatır
 * (API Key yüklendikten sonra emin olmak için)
 */
const getAiModel = (modelName = "gemini-pro") => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY .env dosyasında bulunamadı. Lütfen anahtarınızı ekleyin.');
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: modelName });
};

/**
 * Metin içindeki JSON bloğunu ayıklar ve objeye çevirir
 */
const parseAiJson = (text) => {
    console.log('AI Ham Yanıt:', text);
    try {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        
        if (start === -1 || end === -1) {
            throw new Error('Metin içinde geçerli bir JSON bloğu bulunamadı.');
        }
        
        const jsonStr = text.substring(start, end + 1);
        const parsed = JSON.parse(jsonStr);
        console.log('AI Parse Edilen Veri:', parsed);
        return parsed;
    } catch (error) {
        console.error('JSON Parse Hatası:', error, 'Orijinal Metin:', text);
        throw new Error('Yapay zeka cevabı anlaşılamadı (Geçersiz format).');
    }
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
  console.log('OCR İşlemi başlatıldı, MIME:', mimeType);
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
    // OCR için Gemini 1.5 Flash kullanalım (Vision desteği için)
    const model = getAiModel("gemini-1.5-flash");
    const imageParts = [{ inlineData: { data: imageBuffer.toString("base64"), mimeType } }];
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    
    return parseAiJson(text);

  } catch (error) {
    console.error("Gemini OCR Hatası (Yedeğe geçiliyor):", error);
    
    // Herhangi bir hata durumunda Llama'ya geçelim (Daha dayanıklı bir deneyim için)
    try {
        console.warn("Llama (Groq) yedeği devreye giriyor...");
        const llamaText = await callGroqLlama(prompt, imageBuffer, mimeType, true);
        return JSON.parse(llamaText);
    } catch (llamaError) {
        console.error("Llama yedeği de başarısız:", llamaError);
        throw new Error('Yapay zeka servisleri şu an yanıt vermiyor. Lütfen görselin net olduğundan ve internet bağlantınızın olduğundan emin olun.');
    }
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
    console.log('Chat asistanı çağrıldı, Soru:', userQuestion);
    // Sohbet için Gemini Pro kullanalım
    const model = getAiModel("gemini-pro");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();
    console.log('Chat asistanı yanıtı:', answer);
    return answer;
  } catch (error) {
    console.error("Gemini Chat Hatası (Yedeğe geçiliyor):", error);

    // Herhangi bir hata durumunda Llama'ya geçelim
    try {
        console.warn("Asistan yedeği (Llama) devreye giriyor...");
        return await callGroqLlama(prompt, null, null, false);
    } catch (llamaError) {
        console.error("Llama sohbet yedeği başarısız:", llamaError);
        throw new Error('Asistan şu an çok yoğun, lütfen 1 dakika bekleyip tekrar deneyin.');
    }
  }
};

