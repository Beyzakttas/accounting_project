import apiClient from '../api/apiClient';

/**
 * Tüm faturaları getirir
 */
export const getAllInvoices = async () => {
    return await apiClient.get('/invoice');
};

/**
 * Fatura istatistiklerini getirir (Gelir/Gider/Bekleyen)
 */
export const getInvoiceStats = async () => {
    return await apiClient.get('/invoice/stats');
};

/**
 * Yeni fatura oluşturur
 */
export const createInvoice = async (invoiceData) => {
    return await apiClient.post('/invoice', invoiceData);
};

/**
 * Fatura siler
 */
export const deleteInvoice = async (id) => {
    return await apiClient.delete(`/invoice/${id}`);
};
