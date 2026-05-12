import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { getInvoiceStats } from '../services/invoiceService';
import { processInvoiceOCR } from '../services/aiService';
import apiClient from '../api/apiClient';
import { useToast } from '../contexts/ToastContext';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import FormInput from '../components/common/FormInput';
import DashboardStats from '../components/dashboard/DashboardStats';
import DashboardChart from '../components/dashboard/DashboardChart';
import DashboardAiAnalyst from '../components/dashboard/DashboardAiAnalyst';
import { useLanguage } from '../contexts/LanguageContext';
import '../assets/css/Dashboard.css';
import '../assets/css/Invoices.css'; // Reuse invoice styles for modal


const Dashboard = ({ user, onLogout }) => {

  const { addToast } = useToast();
  const { t, language, getDepartmentOptions } = useLanguage();
  const [activeMenu] = useState('Anasayfa');
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    pendingCount: 0
  });

  // AI OCR States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiData, setAiData] = useState({
    invoiceNumber: '',
    description: '',
    amount: '',
    date: '',
    type: 'EXPENSE',
    department: 'Diger',
    vendor: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const fetchCategories = useCallback(async () => {
    try {
      const response = await apiClient.get('/category');
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Kategoriler yüklenemedi:', error);
    }
  }, []);


  const fetchStats = useCallback(async () => {
    try {
      const response = await getInvoiceStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('İstatistikler alınamadı:', err);
      // Sessizce geçebiliriz veya çok kritikse toast basabiliriz
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchCategories();

    const handleUpdate = () => {
      fetchStats();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchStats();
        fetchCategories();
      }
    };

    window.addEventListener('invoiceUpdated', handleUpdate);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', fetchStats);

    // Her 15 saniyede bir otomatik senkronize et
    const interval = setInterval(() => {
      fetchStats();
    }, 15000);

    return () => {
      window.removeEventListener('invoiceUpdated', handleUpdate);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', fetchStats);
      clearInterval(interval);
    };
  }, [fetchStats, fetchCategories]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const response = await processInvoiceOCR(file);
      if (response.success) {
        setAiData({
          ...response.data,
          department: response.data.department || 'Diger',
          invoiceNumber: response.data.invoiceNumber || `AI-${Math.floor(100000 + Math.random() * 900000)}` 
        });
        addToast(language === 'tr' ? 'Fatura başarıyla analiz edildi!' : 'Invoice successfully analyzed!', 'success');
        setShowAiModal(true);
      }
    } catch (error) {
      console.error('AI Analiz Hatası:', error);
      const msg = error.message || (language === 'tr' 
        ? 'Fatura analiz edilirken bir sorun oluştu. Lütfen görselin net olduğundan emin olup tekrar deneyin.' 
        : 'An error occurred while analyzing the invoice. Please ensure the image is clear and try again.');
      addToast(msg, 'error');
    } finally {
      setIsAnalyzing(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleSaveAiInvoice = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    
    try {
      const savePayload = {
        ...aiData,
        category: null,
        department: aiData.department || 'Diger'
      };

      const response = await apiClient.post('/invoice', savePayload);

      if (response.success) {
        setShowAiModal(false);
        addToast(language === 'tr' ? 'Fatura kaydedildi.' : 'Invoice saved.', 'success');
        fetchStats();
        window.dispatchEvent(new CustomEvent('invoiceUpdated'));
      }
    } catch (error) {
      // Mükerrer kayıt durumu (Backend'den existingId geldiğinde)
      if (error.data?.existingId) {
        const confirmMessage = error.data.type === 'DUPLICATE_NUMBER' 
          ? (language === 'tr' ? `Bu fatura numarası (${aiData.invoiceNumber}) zaten kayıtlı. Mevcut kaydı SİLİP yenisini mi eklemek istersiniz?` : `This invoice number (${aiData.invoiceNumber}) is already registered. Would you like to DELETE the existing record and add the new one?`)
          : (language === 'tr' ? `Bu bilgilere (Tutar/Tarih/Satıcı) sahip bir fatura zaten mevcut. Mevcut kaydı DEĞİŞTİRMEK ister misiniz?` : `An invoice with this information (Amount/Date/Vendor) already exists. Would you like to REPLACE the existing record?`);

        setConfirmState({
          isOpen: true,
          title: language === 'tr' ? 'Mükerrer Fatura Tespiti' : 'Duplicate Invoice Detected',
          message: confirmMessage,
          onConfirm: async () => {
            setConfirmState(prev => ({ ...prev, isOpen: false })); // Hemen kapat ki kullanıcı tıkladığını anlasın
            try {
              setIsSaving(true);
              // 1. Eskisini sil
              try {
                await apiClient.delete(`/invoice/${error.data.existingId}`);
              } catch (delErr) {
                throw new Error(language === 'tr' ? 'Eski kayıt sistemden temizlenemedi, lütfen tekrar deneyin.' : 'The old record could not be cleared from the system, please try again.');
              }

              // 2. Yenisini kaydet
              try {
                const retryResponse = await apiClient.post('/invoice', {
                  ...aiData,
                  category: null,
                  department: aiData.department || 'Diger'
                });
                
                if (retryResponse.success) {
                  setShowAiModal(false);
                  addToast(language === 'tr' ? 'Eski kayıt güncellendi ve yenisi başarıyla kaydedildi.' : 'The old record was updated and the new one was successfully saved.', 'success');
                  fetchStats();
                  window.dispatchEvent(new CustomEvent('invoiceUpdated'));
                }
              } catch (saveErr) {
                throw new Error(language === 'tr' ? 'Yeni fatura bilgileri kaydedilirken bir sorun oluştu.' : 'An error occurred while saving the new invoice details.');
              }
            } catch (overwriteError) {
              addToast(overwriteError.message, 'error');
              console.error('Overwrite error details:', overwriteError);
            } finally {
              setIsSaving(false);
            }
          }
        });
      } else {
        addToast(error.message || (language === 'tr' ? 'Kaydedilirken hata oluştu.' : 'An error occurred while saving.'), 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <DashboardLayout
      user={user}
      activeMenu={activeMenu}
      onLogout={onLogout}
    >
      {activeMenu === 'Anasayfa' && (
        <>
          <DashboardStats stats={stats} />
          
          <div className="dashboard-grid">
            <DashboardChart stats={stats} />
            <DashboardAiAnalyst 
              isAnalyzing={isAnalyzing} 
              handleFileUpload={handleFileUpload} 
            />
          </div>
        </>
      )}

      {/* AI OCR Confirmation Modal */}
      <Modal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        title={language === 'tr' ? "Yapay Zeka Analiz Sonucu" : "AI Analysis Result"}
        onSubmit={handleSaveAiInvoice}
        submitText={isSaving ? (language === 'tr' ? "Kaydediliyor..." : "Saving...") : (language === 'tr' ? "Verileri Onayla ve Kaydet" : "Confirm & Save Data")}
        maxWidth="600px"
      >
        <div className="invoice-upload-form">
          <div className="form-row">
            <FormInput
              label={language === 'tr' ? "Fatura No" : "Invoice No"}
              name="invoiceNumber"
              value={aiData.invoiceNumber}
              onChange={(e) => setAiData({ ...aiData, invoiceNumber: e.target.value })}
              required
            />
            <FormInput
              label={language === 'tr' ? "Tutar (₺)" : "Amount (₺)"}
              name="amount"
              type="number"
              value={aiData.amount}
              onChange={(e) => setAiData({ ...aiData, amount: e.target.value })}
              required
            />
          </div>

          <FormInput
            label={language === 'tr' ? "Satıcı / Kurum" : "Vendor / Company"}
            name="vendor"
            value={aiData.vendor}
            onChange={(e) => setAiData({ ...aiData, vendor: e.target.value })}
            placeholder={language === 'tr' ? "Örn: Trendyol" : "e.g. Trendyol"}
          />

          <FormInput
            label={language === 'tr' ? "Açıklama" : "Description"}
            name="description"
            value={aiData.description}
            onChange={(e) => setAiData({ ...aiData, description: e.target.value })}
            required
          />

          <div className="form-row">
            <FormInput
              label={language === 'tr' ? "Tarih" : "Date"}
              name="date"
              type="date"
              value={aiData.date ? new Date(aiData.date).toISOString().split('T')[0] : ''}
              onChange={(e) => setAiData({ ...aiData, date: e.target.value })}
              required
            />
            <FormInput
              label={language === 'tr' ? "Departman" : "Department"}
              name="department"
              type="select"
              options={getDepartmentOptions()}
              value={aiData.department || 'Diger'}
              onChange={(e) => setAiData({ ...aiData, department: e.target.value })}
              required
            />
          </div>
        </div>
      </Modal>


      {activeMenu !== 'Anasayfa' && (
        <div className="glass-card empty-state">
          <div className="empty-icon">🚧</div>
          <h2>{language === 'tr' ? "Yapım Aşamasında" : "Under Construction"}</h2>
          <p>{language === 'tr' ? `${activeMenu} sayfası yakında eklenecek.` : `${activeMenu} page will be added soon.`}</p>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onClose={() => setConfirmState({ ...confirmState, isOpen: false })}
        onConfirm={confirmState.onConfirm}
      />
    </DashboardLayout>
  );
};

export default Dashboard;