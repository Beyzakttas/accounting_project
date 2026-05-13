import Tesseract from 'tesseract.js';

// Standart Regex Desenleri
const REGEX_PATTERNS = {
  // TR ile başlayan 24 haneli IBAN (boşluklu veya boşluksuz)
  iban: /TR\d{2}\s?(?:\d{4}\s?){5}\d{2}/i,
  
  // 10 Haneli Vergi Kimlik Numarası (VKN) veya 11 Haneli TCKN (Fatura No için)
  vkn: /\b\d{10,11}\b/,
  
  // GG.AA.YYYY veya YYYY-AA-GG formatında Tarih
  date: /\b\d{2}[./-]\d{2}[./-]\d{4}\b|\b\d{4}[./-]\d{2}[./-]\d{2}\b/,
  
  // Fatura Tutarı (Örn: 1.250,50 veya 150.00 TL veya 12,50)
  amountCandidates: /\b\d{1,3}(?:[.,]\d{3})*[.,]\d{2}\b/g
};

/**
 * 1. Tesseract.js ile Tarayıcı İçi OCR (İstemci Tarafında Çalışır)
 * @param {File} file - Fatura görseli
 * @returns {Promise<string>} - Çıkartılan ham metin
 */
export const performLocalOCR = async (file) => {
  try {
    console.log('Tesseract.js yerel OCR başlatılıyor...');
    
    // Tesseract'ı Türkçe ('tur') ve opsiyonel İngilizce ('eng') diliyle başlat
    // Tarayıcı önbelleğinde modeller yoksa indirilecektir (~15MB)
    const worker = await Tesseract.createWorker(['tur', 'eng']);
    
    // İşlemci dostu ve hızlı mod (OEM 1: Neural nets LSTM only)
    await worker.setParameters({
      tessedit_ocr_engine_mode: 1,
      tessedit_pageseg_mode: 3, // Otomatik sayfa segmentasyonu
    });

    const { data: { text } } = await worker.recognize(file);
    await worker.terminate(); // Belleği temizle
    
    console.log('Yerel OCR tamamlandı. Metin uzunluğu:', text.length);
    return text;
  } catch (error) {
    console.error('Tesseract OCR Hatası:', error);
    throw new Error('Yerel OCR işlemi başarısız oldu.');
  }
};

/**
 * 2. Regex Motoru ile Hızlı Veri Çıkarımı
 * @param {string} rawText - Fatura ham metni
 * @returns {Object} - Tespit edilen veriler
 */
export const parseTextWithRegex = (rawText) => {
  if (!rawText) return {};

  const extracted = {
    iban: rawText.match(REGEX_PATTERNS.iban)?.[0] || null,
    vkn: rawText.match(REGEX_PATTERNS.vkn)?.[0] || null,
    date: rawText.match(REGEX_PATTERNS.date)?.[0] || null,
    amount: null
  };

  // Tutar analizi: Metindeki tüm tutar formatındaki sayıları bul
  const amountMatches = rawText.match(REGEX_PATTERNS.amountCandidates);
  if (amountMatches && amountMatches.length > 0) {
    // Sayıları bilgisayarın anlayacağı formata (float) çevir
    const parsedAmounts = amountMatches.map(val => {
      // "1.250,50" -> "1250.50"
      // "1,250.50" -> "1250.50"
      let clean = val;
      // Eğer string'de hem nokta hem virgül varsa (örn: 1.250,50), noktaları sil, virgülü noktaya çevir
      if (clean.includes('.') && clean.includes(',')) {
        if (clean.indexOf(',') > clean.indexOf('.')) {
          // TR format: 1.250,50
          clean = clean.replace(/\./g, '').replace(',', '.');
        } else {
          // EN format: 1,250.50
          clean = clean.replace(/,/g, '');
        }
      } else if (clean.includes(',')) {
        // Sadece virgül varsa: 150,50
        clean = clean.replace(',', '.');
      }
      return parseFloat(clean);
    });

    // Bulunan tutarlar içinden geçerli olanların en büyüğünü al (Fatura genel toplamı genelde en büyüktür)
    const validAmounts = parsedAmounts.filter(val => !isNaN(val));
    if (validAmounts.length > 0) {
      extracted.amount = Math.max(...validAmounts);
    }
  }

  // Tarih düzeltmesi: GG.AA.YYYY -> YYYY-MM-DD
  if (extracted.date) {
    let d = extracted.date.replace(/\//g, '.').replace(/-/g, '.');
    const parts = d.split('.');
    if (parts.length === 3) {
      // Eğer ilk kısım gün ise (uzunluğu 2), format GG.AA.YYYY'dir.
      if (parts[0].length === 2 && parts[2].length === 4) {
        extracted.date = `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else if (parts[0].length === 4 && parts[2].length === 2) {
        // Zaten YYYY-MM-DD formatında
        extracted.date = `${parts[0]}-${parts[1]}-${parts[2]}`;
      }
    }
  }

  // VKN'yi invoiceNumber olarak kullan
  extracted.invoiceNumber = extracted.vkn;

  return extracted;
};

/**
 * 3. Çevrimdışı/Yerel Tahmin Sözlüğü (Heuristic Engine)
 * İnternet yoksa veya LLM başarısız olursa kategoriyi ve satıcıyı metinden tahmin eder.
 * @param {string} rawText 
 * @returns {Object} { category, vendor, description }
 */
export const getOfflineHeuristics = (rawText) => {
  const lowerText = rawText.toLowerCase();
  
  let category = 'Diger';
  let vendor = '';
  let description = 'Yerel OCR Analizi';

  const categoryRules = {
    'Yemek': ['starbucks', 'yemeksepeti', 'getir', 'cafe', 'kahve', 'lokanta', 'kebap', 'döner', 'restoran', 'köfteci', 'pide'],
    'Market': ['migros', 'carrefour', 'bim', 'şok', 'a101', 'tekel', 'market', 'büfe', 'gross'],
    'Ulasim': ['shell', 'opet', 'bp', 'petrol ofisi', 'total', 'taksi', 'uber', 'bitaksi', 'yolcu', 'otobüs', 'thy', 'pegasus', 'iett', 'martı'],
    'Teknoloji': ['vatan', 'teknosa', 'mediamarkt', 'apple', 'hepsiburada', 'trendyol', 'amazon', 'bilgisayar', 'elektronik'],
    'Ofis': ['kırtasiye', 'kargo', 'yurtiçi kargo', 'mng', 'aras kargo', 'fotokopi', 'kağıt']
  };

  // Kategori ve Satıcı tespiti
  for (const [catName, keywords] of Object.entries(categoryRules)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        category = catName;
        // Satıcı adını büyük harfle başlatıp bulduğumuz anahtar kelime yapıyoruz
        vendor = keyword.charAt(0).toUpperCase() + keyword.slice(1);
        description = `${vendor} ${catName} Harcaması`;
        break;
      }
    }
    if (vendor) break; // Bulduysak aramayı bırak
  }

  return { category, vendor, description };
};
