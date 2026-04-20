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
import '../assets/css/Dashboard.css';
import '../assets/css/Invoices.css'; // Reuse invoice styles for modal


const Dashboard = ({ user, onLogout }) => {

  const { addToast } = useToast();
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
    category: '',
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
    } catch (error) {
      console.error('İstatistikler alınamadı:', error);
      addToast('İstatistikler yüklenirken bir hata oluştu.', 'error');
    }
  }, [addToast]);

  useEffect(() => {
    fetchStats();
    fetchCategories();
  }, [fetchStats, fetchCategories]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const response = await processInvoiceOCR(file);
      if (response.success) {
        // Backend'den ID gelmiş olsa bile biz ismini gösterelim (Kullanıcı için daha anlaşılır)
        let categoryDisplay = response.data.category || '';

        // Eğer ID geldiyse ismine çevirelim
        const found = categories.find(c => c._id === categoryDisplay);
        if (found) {
          categoryDisplay = found.name;
        }

        setAiData({
          ...response.data,
          category: categoryDisplay,
          invoiceNumber: response.data.invoiceNumber || `AI-${Math.floor(100000 + Math.random() * 900000)}` 
        });
        addToast('Fatura başarıyla analiz edildi!', 'success');
        setShowAiModal(true);
      }
    } catch (error) {
      console.error('AI Analiz Hatası:', error);
      // Backend'den gelen maskelenmiş mesajı göster veya genel bir hata ver
      const msg = error.message || 'Fatura analiz edilirken bir hata oluştu.';
      addToast(msg, msg.includes('yoğun') ? 'info' : 'error');
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
      let finalCategoryId = null;
      const existingCategory = categories.find(c => c.name.toLowerCase() === aiData.category.toLowerCase());

      if (existingCategory) {
        finalCategoryId = existingCategory._id;
      } else if (aiData.category.trim()) {
        const catResponse = await apiClient.post('/category', { name: aiData.category.trim() });
        if (catResponse.success) {
          finalCategoryId = catResponse.data._id;
          fetchCategories();
        }
      }

      const savePayload = {
        ...aiData,
        category: finalCategoryId || null
      };

      const response = await apiClient.post('/invoice', savePayload);

      if (response.success) {
        setShowAiModal(false);
        addToast('Fatura kaydedildi.', 'success');
        fetchStats();
        window.dispatchEvent(new CustomEvent('invoiceUpdated'));
      }
    } catch (error) {
      // Mükerrer kayıt durumu (Backend'den existingId geldiğinde)
      if (error.data?.existingId) {
        const confirmMessage = error.data.type === 'DUPLICATE_NUMBER' 
          ? `Bu fatura numarası (${aiData.invoiceNumber}) zaten kayıtlı. Mevcut kaydı SİLİP yenisini mi eklemek istersiniz?`
          : `Bu bilgilere (Tutar/Tarih/Satıcı) sahip bir fatura zaten mevcut. Mevcut kaydı DEĞİŞTİRMEK ister misiniz?`;

        setConfirmState({
          isOpen: true,
          title: 'Mükerrer Fatura Tespiti',
          message: confirmMessage,
          onConfirm: async () => {
            setConfirmState(prev => ({ ...prev, isOpen: false })); // Hemen kapat ki kullanıcı tıkladığını anlasın
            try {
              setIsSaving(true);
              // 1. Eskisini sil
              try {
                await apiClient.delete(`/invoice/${error.data.existingId}`);
              } catch (delErr) {
                throw new Error(`Eski fatura silinemedi: ${delErr.message}`);
              }

              // 2. Yenisini kaydet
              try {
                const finalCategoryId = categories.find(c => c.name.toLowerCase() === aiData.category.toLowerCase())?._id;
                const retryResponse = await apiClient.post('/invoice', {
                  ...aiData,
                  category: finalCategoryId || null
                });
                
                if (retryResponse.success) {
                  setShowAiModal(false);
                  addToast('Eski fatura silindi ve yenisi başarıyla kaydedildi.', 'success');
                  fetchStats();
                  window.dispatchEvent(new CustomEvent('invoiceUpdated'));
                }
              } catch (saveErr) {
                throw new Error(`Yeni fatura kaydedilemedi: ${saveErr.message}`);
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
        addToast(error.message || 'Kaydedilirken hata oluştu.', 'error');
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
        title="Yapay Zeka Analiz Sonucu"
        onSubmit={handleSaveAiInvoice}
        submitText={isSaving ? "Kaydediliyor..." : "Verileri Onayla ve Kaydet"}
        maxWidth="600px"
      >
        <div className="invoice-upload-form">
          <div className="form-row">
            <FormInput
              label="Fatura No"
              name="invoiceNumber"
              value={aiData.invoiceNumber}
              onChange={(e) => setAiData({ ...aiData, invoiceNumber: e.target.value })}
              required
            />
            <FormInput
              label="Tutar (₺)"
              name="amount"
              type="number"
              value={aiData.amount}
              onChange={(e) => setAiData({ ...aiData, amount: e.target.value })}
              required
            />
          </div>

          <FormInput
            label="Satıcı / Kurum"
            name="vendor"
            value={aiData.vendor}
            onChange={(e) => setAiData({ ...aiData, vendor: e.target.value })}
            placeholder="Örn: Trendyol"
          />

          <FormInput
            label="Açıklama"
            name="description"
            value={aiData.description}
            onChange={(e) => setAiData({ ...aiData, description: e.target.value })}
            required
          />

          <div className="form-row">
            <FormInput
              label="Tarih"
              name="date"
              type="date"
              value={aiData.date ? new Date(aiData.date).toISOString().split('T')[0] : ''}
              onChange={(e) => setAiData({ ...aiData, date: e.target.value })}
              required
            />
            <FormInput
              label="Kategori"
              name="category"
              type="text"
              value={aiData.category}
              onChange={(e) => setAiData({ ...aiData, category: e.target.value })}
              placeholder="Fatura kategorisi (Market, Yemek vb.)"
            />
          </div>
        </div>
      </Modal>


      {activeMenu !== 'Anasayfa' && (
        <div className="glass-card empty-state">
          <div className="empty-icon">🚧</div>
          <h2>Yapım Aşamasında</h2>
          <p>{activeMenu} sayfası yakında eklenecek.</p>
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