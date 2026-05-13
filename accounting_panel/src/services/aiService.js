import apiClient from '../api/apiClient';
import { performLocalOCR, parseTextWithRegex, getOfflineHeuristics } from './localExtractor';

/**
 * Fatura OCR işlemi (Görselden veri çıkarma) - Eski (Fallback) Yöntem
 */
export const processInvoiceOCR = async (file) => {
  const formData = new FormData();
  formData.append('invoice', file);

  try {
    const response = await apiClient.post('/ai/ocr', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  } catch (error) {
    console.error('OCR Hatası:', error);
    throw error;
  }
};

/**
 * Hibrit OCR İşlemi (Tesseract.js + Regex + Backend API)
 */
export const processInvoiceHybrid = async (file, onProgress) => {
  try {
    // 1. İstemci tarafı OCR
    if (onProgress) onProgress('Yapay Zeka Analiz Ediyor...');
    let rawText = '';
    try {
      rawText = await performLocalOCR(file);
    } catch (localOcrErr) {
      console.warn('Yerel OCR başarısız, eski sunucu tabanlı OCR yöntemine geçiliyor...', localOcrErr);
      if (onProgress) onProgress('Yapay Zeka Analiz Ediyor...');
      return await processInvoiceOCR(file); // Fallback!
    }

    // 2. Regex ile veri çıkarma
    const extracted = parseTextWithRegex(rawText);
    
    // 3. Backend'e gönderip anlamsal verileri alma
    if (onProgress) onProgress('Yapay Zeka Analiz Ediyor...');
    try {
      const response = await apiClient.post('/ai/ocr-text', { text: rawText, extracted });
      return response; // Backend başarılıysa bunu dön
    } catch (apiError) {
      console.warn('Backend API başarısız, çevrimdışı yerel verilere (Heuristics) geçiliyor...', apiError);
      
      // 4. Çevrimdışı (Offline) Fallback
      const heuristics = getOfflineHeuristics(rawText);
      return {
        success: true,
        data: {
          ...extracted, // amount, date, vkn, iban
          ...heuristics, // category, vendor, description
          type: 'EXPENSE',
          taxAmount: 0 // Çevrimdışı vergisiz tahmin
        }
      };
    }

  } catch (error) {
    console.error('Hibrit Analiz Hatası:', error);
    throw error;
  }
};

/**
 * Finansal Asistan Sohbeti
 */
export const askAiAssistant = async (question, language = 'tr') => {
  try {
    const response = await apiClient.post('/ai/chat', { question, language });
    return response;
  } catch (error) {
    console.error('Chat Hatası:', error);
    throw error;
  }
};
