import apiClient from '../api/apiClient';

/**
 * Fatura OCR işlemi (Görselden veri çıkarma)
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
 * Finansal Asistan Sohbeti
 */
export const askAiAssistant = async (question) => {
  try {
    const response = await apiClient.post('/ai/chat', { question });
    return response;
  } catch (error) {
    console.error('Chat Hatası:', error);
    throw error;
  }
};
