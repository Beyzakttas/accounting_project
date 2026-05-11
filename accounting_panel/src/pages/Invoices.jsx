import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Modal from '../components/common/Modal';
import FormInput from '../components/common/FormInput';
import { useToast } from '../contexts/ToastContext';
import apiClient from '../api/apiClient';
import { useLanguage } from '../contexts/LanguageContext';
import '../assets/css/Invoices.css';

const Invoices = ({ user, onLogout }) => {
  const { addToast } = useToast();
  const { t, language } = useLanguage();
  const location = useLocation();
  const [invoices, setInvoices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [invoiceToPay, setInvoiceToPay] = useState(null);
  const [paying, setPaying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [activeMenu] = useState('Faturalar');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'PENDING', 'PAID'
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [highlightedId, setHighlightedId] = useState(null);

  const generateInvoiceNumber = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `FT-${yyyy}${mm}${dd}-${random}`;
  };

  // Form state
  const resetForm = () => {
    setFormData({
      invoiceNumber: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      type: 'EXPENSE',
      status: 'Pending',
      category: '',
      department: 'Diger'
    });
    setIsEditing(false);
    setEditingInvoiceId(null);
    setCustomCategoryName('');
  };

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: 'EXPENSE',
    status: 'Pending',
    category: '',
    department: 'Diger'
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [invoiceRes, categoryRes] = await Promise.allSettled([
        apiClient.get('/invoice'),
        apiClient.get('/category')
      ]);

      if (invoiceRes.status === 'fulfilled' && invoiceRes.value.success) {
        setInvoices(invoiceRes.value.data);
      }

      if (categoryRes.status === 'fulfilled' && categoryRes.value.success) {
        setCategories(categoryRes.value.data);
      }

      // Eğer her ikisi de hata verdiyse genel bir mesaj göster
      if (invoiceRes.status === 'rejected' && categoryRes.status === 'rejected') {
        addToast(language === 'tr' ? 'Sunucuya şu an ulaşılamıyor, lütfen internet bağlantınızı kontrol edin.' : 'Server is currently unreachable, please check your internet connection.', 'error');
      } else {
        // Tekil hataları yönet
        if (invoiceRes.status === 'rejected') {
          addToast(language === 'tr' ? 'Faturalar yüklenirken bir sorun oluştu.' : 'A problem occurred while loading invoices.', 'error');
        }
        if (categoryRes.status === 'rejected') {
          addToast(language === 'tr' ? 'Kategoriler yüklenirken bir sorun oluştu.' : 'A problem occurred while loading categories.', 'error');
        }
      }
    } catch (error) {
      console.error('Veri çekme hatası:', error);
    } finally {
      setLoading(false);
    }
  }, [addToast, language]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id') || queryParams.get('highlight');
    if (id) {
      setHighlightedId(id);
      setFilter('ALL');

      const timer = setTimeout(() => {
        const element = document.getElementById(`invoice-card-${id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [location.search, invoices]);

  const handleSubmitInvoice = async (e) => {
    e.preventDefault();
    try {
      let categoryId = formData.category;

      // Kullanıcı "Diğer" seçtiyse, önce yeni kategoriyi oluştur
      if (formData.category === 'other') {
        if (!customCategoryName.trim()) {
          addToast(language === 'tr' ? 'Lütfen kategori adı girin.' : 'Please enter a category name.', 'error');
          return;
        }
        const catResponse = await apiClient.post('/category', { name: customCategoryName.trim() });
        if (catResponse.success) {
          categoryId = catResponse.data._id;
          setCategories(prev => [...prev, catResponse.data]);
        }
      }

      const finalInvoiceNumber = formData.invoiceNumber?.trim() || generateInvoiceNumber();
      const invoicePayload = { ...formData, invoiceNumber: finalInvoiceNumber, category: categoryId || null };
      let response;
      if (isEditing) {
        response = await apiClient.put(`/invoice/${editingInvoiceId}`, invoicePayload);
      } else {
        response = await apiClient.post('/invoice', invoicePayload);
      }

      if (response.success) {
        setShowModal(false);
        resetForm();
        fetchData();
        addToast(isEditing ? (language === 'tr' ? 'Fatura başarıyla güncellendi.' : 'Invoice successfully updated.') : (language === 'tr' ? 'Fatura başarıyla oluşturuldu.' : 'Invoice successfully created.'), 'success');
        // Raporlar sayfasının veriyi yenilemesi için event gönder
        window.dispatchEvent(new CustomEvent('invoiceUpdated'));
      }
    } catch (error) {
      addToast(error.message || (language === 'tr' ? 'Kaydetme işlemi sırasında bir sorun oluştu, lütfen girdiğiniz bilgileri kontrol edin.' : 'An error occurred during saving, please check your inputs.'), 'error');
    }
  };

  const handleEditClick = (invoice) => {
    setIsEditing(true);
    setEditingInvoiceId(invoice._id);
    setFormData({
      invoiceNumber: invoice.invoiceNumber,
      description: invoice.description,
      amount: invoice.amount,
      date: new Date(invoice.date).toISOString().split('T')[0],
      type: invoice.type,
      status: invoice.status || 'Pending',
      category: invoice.category?._id || invoice.category || '',
      department: invoice.department || 'Diger'
    });
    setShowModal(true);
  };

  const handleDeleteClick = (invoice) => {
    setInvoiceToDelete(invoice);
    setShowDeleteModal(true);
  };

  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/invoice/${invoiceToDelete._id}`);
      setShowDeleteModal(false);
      setInvoiceToDelete(null);
      fetchData();
      addToast(language === 'tr' ? 'Fatura başarıyla silindi.' : 'Invoice successfully deleted.', 'success');
    } catch (error) {
      addToast(error.message || (language === 'tr' ? 'Silme işlemi başarısız.' : 'Deletion failed.'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handlePayClick = (invoice) => {
    setInvoiceToPay(invoice);
    setShowPayModal(true);
  };

  const handlePayInvoice = async () => {
    if (!invoiceToPay) return;
    setPaying(true);
    try {
      const response = await apiClient.put(`/invoice/${invoiceToPay._id}/pay`);
      if (response.success) {
        setShowPayModal(false);
        setInvoiceToPay(null);
        fetchData();
        addToast(language === 'tr' ? 'Fatura başarıyla ödendi ve işlendi.' : 'Invoice successfully paid and processed.', 'success');
        window.dispatchEvent(new CustomEvent('invoiceUpdated'));
      }
    } catch (error) {
      addToast(error.message || (language === 'tr' ? 'Ödeme işlemi başarısız oldu.' : 'Payment process failed.'), 'error');
    } finally {
      setPaying(false);
    }
  };

  return (
    <DashboardLayout
      user={user}
      activeMenu={activeMenu}
      onAddInvoice={() => setShowModal(true)}
      onLogout={onLogout}
    >
      <div className="invoices-container">
        <div className="filter-bar glass-card">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder={language === 'tr' ? "Fatura no, açıklama veya satıcı ara..." : "Search invoice no, description or vendor..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="custom-dropdown-container">
            <button
              className={`dropdown-trigger glass-card ${isFilterDropdownOpen ? 'open' : ''}`}
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            >
              <span className="selected-value">
                {filter === 'ALL' ? (language === 'tr' ? 'Tüm Faturalar' : 'All Invoices') : filter === 'PENDING' ? (language === 'tr' ? 'Bekleyen Faturalar' : 'Pending Invoices') : (language === 'tr' ? 'Ödenen Faturalar' : 'Paid Invoices')}
              </span>
              <span className="dropdown-arrow"></span>
            </button>

            {isFilterDropdownOpen && (
              <div className="dropdown-menu glass-card">
                <div
                  className={`dropdown-item ${filter === 'ALL' ? 'active' : ''}`}
                  onClick={() => { setFilter('ALL'); setIsFilterDropdownOpen(false); }}
                >
                  {language === 'tr' ? 'Tüm Faturalar' : 'All Invoices'}
                </div>
                <div
                  className={`dropdown-item ${filter === 'PENDING' ? 'active' : ''}`}
                  onClick={() => { setFilter('PENDING'); setIsFilterDropdownOpen(false); }}
                >
                  {language === 'tr' ? 'Bekleyen Faturalar' : 'Pending Invoices'}
                </div>
                <div
                  className={`dropdown-item ${filter === 'PAID' ? 'active' : ''}`}
                  onClick={() => { setFilter('PAID'); setIsFilterDropdownOpen(false); }}
                >
                  {language === 'tr' ? 'Ödenen Faturalar' : 'Paid Invoices'}
                </div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="loading-state">{t('common.loading')}</div>
        ) : (
          <div className="invoice-grid">
            {invoices
              .filter(inv => {
                const matchesFilter =
                  filter === 'ALL' ||
                  (filter === 'PENDING' && inv.status === 'Pending') ||
                  (filter === 'PAID' && inv.status === 'Processed');
                const matchesSearch =
                  (inv.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (inv.description?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (inv.vendor?.toLowerCase().includes(searchQuery.toLowerCase()));
                return matchesFilter && matchesSearch;
              })
              .map((invoice) => (
                <div 
                  key={invoice._id} 
                  id={`invoice-card-${invoice._id}`}
                  className={`glass-card invoice-card ${highlightedId === invoice._id ? 'highlighted' : ''}`}
                >
                  <div className="invoice-card-header">
                    <span className="invoice-type">{invoice.category?.name || (language === 'tr' ? 'Fatura' : 'Invoice')}</span>
                    <span className={`invoice-status status-${(invoice.status || 'pending').toLowerCase()}`}>
                      {invoice.status === 'Pending' ? (language === 'tr' ? 'Beklemede' : 'Pending') : (language === 'tr' ? 'Ödendi' : 'Paid')}
                    </span>
                  </div>
                  <div className="invoice-amount">
                    {apiClient.formatCurrency(invoice.amount)}
                  </div>
                  <div className="invoice-info">
                    <div className="info-row">
                      <span>{language === 'tr' ? 'No:' : 'No:'}</span>
                      <span className="info-value">{invoice.invoiceNumber || '-'}</span>
                    </div>
                    <div className="info-row">
                      <span>{t('topbar.description')}:</span>
                      <span className="info-value">{invoice.description}</span>
                    </div>
                    <div className="info-row">
                      <span>{t('topbar.uploadedBy')}:</span>
                      <span className="info-value">
                        {invoice.uploadedBy?.fullname || invoice.uploadedBy?.name || invoice.uploadedBy?.email || (language === 'tr' ? 'Sistem' : 'System')}
                      </span>
                    </div>
                  </div>
                  <div className="invoice-card-footer">
                    <span className="invoice-date">
                      {apiClient.formatDate(invoice.date)}
                    </span>
                    <div className="invoice-actions">
                      {invoice.status === 'Pending' && (
                        <button className="action-btn text-btn pay-btn" title={language === 'tr' ? 'Öde' : 'Pay'} onClick={() => handlePayClick(invoice)}>{language === 'tr' ? 'Öde' : 'Pay'}</button>
                      )}
                      <button className="action-btn text-btn" title={language === 'tr' ? 'Düzenle' : 'Edit'} onClick={() => handleEditClick(invoice)}>{language === 'tr' ? 'Düzenle' : 'Edit'}</button>
                      <button className="action-btn text-btn delete-btn" title={language === 'tr' ? 'Sil' : 'Delete'} onClick={() => handleDeleteClick(invoice)}>{language === 'tr' ? 'Sil' : 'Delete'}</button>
                    </div>
                  </div>
                </div>
              ))}

            {invoices.length === 0 && (
              <div className="glass-card no-invoices">
                <div className="empty-icon">📄</div>
                <h3>{language === 'tr' ? 'Fatura Bulunmuyor' : 'No Invoices Found'}</h3>
                <p>{language === 'tr' ? 'Henüz sisteme fatura eklenmemiş.' : 'No invoices have been added to the system yet.'}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload/Create Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={isEditing ? (language === 'tr' ? "Faturayı Düzenle" : "Edit Invoice") : (language === 'tr' ? "Yeni Fatura Ekle" : "Add New Invoice")}
        onSubmit={handleSubmitInvoice}
        submitText={isEditing ? (language === 'tr' ? "Güncelle" : "Update") : (language === 'tr' ? "Faturayı Kaydet" : "Save Invoice")}
        submitClassName="upload-invoice-btn"
        closeOnOverlayClick={false}
      >
        <div className="invoice-upload-form">
          <div className="form-row">
            <FormInput
              label={language === 'tr' ? "Fatura No" : "Invoice No"}
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
              placeholder={t('invoices.invoiceNumberPlaceholder')}
            />
            <FormInput
              label={language === 'tr' ? "Tutar (₺)" : "Amount (₺)"}
              type="number"
              name="amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              step="0.01"
              required
            />
          </div>

          <FormInput
            label={language === 'tr' ? "Açıklama" : "Description"}
            type="text"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={language === 'tr' ? "Hizmet bedeli, Amazon alımı vb." : "Service fee, Amazon purchase etc."}
            required
          />

          <div className="form-row">
            <FormInput
              label={language === 'tr' ? "Tarih" : "Date"}
              type="date"
              name="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <FormInput
              label={language === 'tr' ? "Satıcı / Kurum" : "Vendor / Company"}
              type="text"
              name="vendor"
              value={formData.vendor || ''}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              placeholder={language === 'tr' ? "Örn: Trendyol, Hepsiburada" : "e.g. Amazon, Apple"}
            />
          </div>

          <div className="form-row">
            <FormInput
              label={language === 'tr' ? "Kategori" : "Category"}
              type="select"
              name="category"
              options={[
                ...categories.map(cat => ({ value: cat._id, label: cat.name })),
                { value: 'other', label: language === 'tr' ? '+ Diğer (Yeni Kategori Ekle)' : '+ Other (Add New Category)' }
              ]}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder={language === 'tr' ? "-- Kategori Seçin --" : "-- Select Category --"}
            />

            <FormInput
              label={language === 'tr' ? "Departman" : "Department"}
              type="select"
              name="department"
              options={[
                { value: 'Muhasebe', label: language === 'tr' ? 'Muhasebe' : 'Accounting' },
                { value: 'Finans', label: language === 'tr' ? 'Finans' : 'Finance' },
                { value: 'IK', label: language === 'tr' ? 'İnsan Kaynakları (IK)' : 'Human Resources (HR)' },
                { value: 'Satis', label: language === 'tr' ? 'Satış' : 'Sales' },
                { value: 'Pazarlama', label: language === 'tr' ? 'Pazarlama' : 'Marketing' },
                { value: 'Yazilim', label: language === 'tr' ? 'Yazılım' : 'Software' },
                { value: 'Operasyon', label: language === 'tr' ? 'Operasyon' : 'Operations' },
                { value: 'Diger', label: language === 'tr' ? 'Diğer' : 'Other' }
              ]}
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>

          {formData.category === 'other' && (
            <div className="form-group other-category-group">
              <input
                type="text"
                placeholder={language === 'tr' ? "Yeni kategori adı girin..." : "Enter new category name..."}
                value={customCategoryName}
                onChange={(e) => setCustomCategoryName(e.target.value)}
                className="other-category-input"
              />
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setInvoiceToDelete(null);
        }}
        onSubmit={(e) => {
          e.preventDefault();
          handleDeleteInvoice();
        }}
        title={language === 'tr' ? "Faturayı Sil" : "Delete Invoice"}
        submitText={deleting ? (language === 'tr' ? 'Siliniyor...' : 'Deleting...') : (language === 'tr' ? 'Evet, Sil' : 'Yes, Delete')}
        submitClassName="danger-btn"
        maxWidth="450px"
      >
        <div className="modal-confirm-content">
          <p className="modal-confirm-message">
            {language === 'tr' ? (
              <>
                Seçili faturayı sistemden kalıcı olarak silmek istediğinize emin misiniz? <br />
                <span className="modal-confirm-warning">Bu işlem geri alınamaz.</span>
              </>
            ) : (
              <>
                Are you sure you want to permanently delete the selected invoice? <br />
                <span className="modal-confirm-warning">This action cannot be undone.</span>
              </>
            )}
          </p>
        </div>
      </Modal>

      {/* Payment Confirmation Modal */}
      <Modal
        isOpen={showPayModal}
        onClose={() => {
          setShowPayModal(false);
          setInvoiceToPay(null);
        }}
        onSubmit={(e) => {
          e.preventDefault();
          handlePayInvoice();
        }}
        title={language === 'tr' ? "Ödeme Onayı" : "Payment Confirmation"}
        submitText={paying ? (language === 'tr' ? 'Ödeniyor...' : 'Paying...') : (language === 'tr' ? 'Evet, Öde' : 'Yes, Pay')}
        submitClassName="upload-invoice-btn"
        maxWidth="450px"
      >
        <div className="modal-confirm-content">
          <p className="modal-confirm-message">
            {language === 'tr' ? (
              <>
                Seçili fatura için ödeme işlemini onaylıyor musunuz? <br />
                {invoiceToPay && (
                  <span className="modal-confirm-highlight">
                    Tutar: {apiClient.formatCurrency(invoiceToPay.amount)}
                  </span>
                )}
              </>
            ) : (
              <>
                Do you confirm the payment for the selected invoice? <br />
                {invoiceToPay && (
                  <span className="modal-confirm-highlight">
                    Amount: {apiClient.formatCurrency(invoiceToPay.amount)}
                  </span>
                )}
              </>
            )}
          </p>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Invoices;
