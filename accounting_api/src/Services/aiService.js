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
    - dueDate: Son ödeme veya vade tarihi (YYYY-MM-DD formatında, faturada açıkça belirtilmemişse fatura tarihine +14 gün ekle)
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
      "dueDate": "2024-05-04",
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
 * Fatura OCR işlemi - YENİ (Ham Metin Üzerinden Hibrit Analiz)
 * @param {string} text - Tarayıcıda Tesseract ile çıkarılmış metin
 * @param {Object} extracted - Frontend Regex tarafından zaten tespit edilmiş veriler
 */
export const extractInvoiceDataFromText = async (text, extracted = {}) => {
  console.log('Bulut API Metin Analizi başlatıldı...');
  
  const prompt = `
    Sen profesyonel bir muhasebe asistanısın. Aşağıdaki fatura/fiş metnini analiz et ve eksik alanları doldurarak JSON formatında döndür.
    Sadece JSON döndür, başka açıklama yapma.
    
    Önceden Regex ile kesin tespit edilen veriler (Bunları DÜZENLEME, sadece JSON'a aynen ekle):
    - Tutar (amount): ${extracted.amount || 'Bulunamadı'}
    - Tarih (date): ${extracted.date || 'Bulunamadı'}
    - IBAN (iban): ${extracted.iban || 'Bulunamadı'}
    - Fatura No (invoiceNumber): ${extracted.invoiceNumber || 'Bulunamadı'}

    Metinden bulmanı ve tahmin etmeni beklediğimiz eksik alanlar:
    - vendor: Satıcı adı veya Şirket Ünvanı (Örn: Starbucks, Migros)
    - dueDate: Son ödeme veya vade tarihi (YYYY-MM-DD formatında, faturada açıkça belirtilmemişse fatura tarihine +14 gün ekle)
    - category: Faturanın kategorisi (Sadece şu seçeneklerden biri: 'Yemek', 'Ulaşım', 'Market', 'Teknoloji', 'Ofis', 'Diğer')
    - description: Faturanın kısa özeti (Örn: Filtre Kahve Harcaması)
    - taxAmount: KDV tutarı (Metinden çıkarabilirsen yaz, yoksa 0)
    - type: 'EXPENSE' (Sabit)

    Fatura Metni:
    ---
    ${text.substring(0, 2000)} // Metin çok uzunsa kırpalım
    ---
  `;

  try {
    // Sadece metin işlediğimiz için çok hızlı dönecektir
    const model = getAiModel("gemini-1.5-flash-latest");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();
    
    const parsedData = parseAiJson(aiText);

    // Eğer Regex bazı verileri bulamamışsa ve AI bulmuşsa birleştir:
    return {
      vendor: parsedData.vendor || "Bilinmeyen Satıcı",
      category: parsedData.category || "Diğer",
      description: parsedData.description || "Fatura Harcaması",
      taxAmount: parsedData.taxAmount || 0,
      type: "EXPENSE",
      amount: extracted.amount || parsedData.amount || 0,
      date: extracted.date || parsedData.date || new Date().toISOString().split('T')[0],
      dueDate: parsedData.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      invoiceNumber: extracted.invoiceNumber || parsedData.invoiceNumber || null,
      iban: extracted.iban || parsedData.iban || null
    };

  } catch (error) {
    console.error("Gemini Metin Analizi Hatası (Yedeğe geçiliyor):", error);
    
    try {
        console.warn("Llama (Groq) metin yedeği devreye giriyor...");
        // callGroqLlama image beklemez, isJson=true
        const llamaText = await callGroqLlama(prompt, null, null, true);
        const parsedLlama = JSON.parse(llamaText);
        
        return {
          vendor: parsedLlama.vendor || "Bilinmeyen Satıcı",
          category: parsedLlama.category || "Diğer",
          description: parsedLlama.description || "Fatura Harcaması",
          taxAmount: parsedLlama.taxAmount || 0,
          type: "EXPENSE",
          amount: extracted.amount || parsedLlama.amount || 0,
          date: extracted.date || parsedLlama.date || new Date().toISOString().split('T')[0],
          dueDate: parsedLlama.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          invoiceNumber: extracted.invoiceNumber || parsedLlama.invoiceNumber || null,
          iban: extracted.iban || parsedLlama.iban || null
        };
    } catch (llamaError) {
        console.error("Llama yedeği de başarısız:", llamaError);
        throw new Error('Metin analiz servisleri şu an yanıt vermiyor.');
    }
  }
};

/**
 * Finansal verilere dayalı tavsiye ve cevap üretir
 * @param {Object} context - Kullanıcının finansal durumu (toplam gelir, gider vb.)
 * @param {string} userQuestion - Kullanıcının sorusu
 */
export const getFinancialChat = async (context, userQuestion, language = 'tr') => {
  const isEnglish = language.toLowerCase() === 'en';

  const prompt = isEnglish ? `
    You are the smart financial assistant of the 'Accounting AI' system.
    You have access to the user's financial data (context), but you should only share them if it is relevant to the question or if the user asks about their financial status.
    
    User's financial data:
    - Total Income: ${context.totalIncome} TL
    - Total Expense: ${context.totalExpense} TL
    - Net Status: ${context.totalIncome - context.totalExpense} TL
    - Pending Invoices: ${context.pendingCount}
    
    User's question: "${userQuestion}"
    
    Instructions:
    1. If the user just said hello/greeted, reply with a short greeting. Never list the budget summary.
    2. Your responses must always be very short and concise. Do not exceed 2-3 sentences.
    3. Only use the context data above if the user asks about their financial status.
    4. Avoid unnecessary advice, focus only on answering the question.
    5. Always reply in English.
  ` : `
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
    5. Her zaman Türkçe cevap ver.
  `;

  try {
    console.log(`Chat asistanı çağrıldı (${language.toUpperCase()}), Soru:`, userQuestion);
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
        throw new Error(isEnglish ? 'Assistant is very busy, please wait 1 minute and try again.' : 'Asistan şu an çok yoğun, lütfen 1 dakika bekleyip tekrar deneyin.');
    }
  }
};

