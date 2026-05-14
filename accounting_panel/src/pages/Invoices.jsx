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
  const { t, getDepartmentOptions } = useLanguage();
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
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
        addToast(t('common.serverUnreachable'), 'error');
      } else {
        // Tekil hataları yönet
        if (invoiceRes.status === 'rejected') {
          addToast(t('invoices.errorLoadingInvoices'), 'error');
        }
        if (categoryRes.status === 'rejected') {
          addToast(t('invoices.errorLoadingCategories'), 'error');
        }
      }
    } catch (error) {
      console.error('Veri çekme hatası:', error);
    } finally {
      setLoading(false);
    }
  }, [addToast, t]);

  useEffect(() => {
    fetchData();

    // Sayfa odaklandığında veya görünür olduğunda verileri güncelle
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', fetchData);

    // Her 15 saniyede bir otomatik senkronize et
    const interval = setInterval(fetchData, 15000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', fetchData);
      clearInterval(interval);
    };
  }, [fetchData]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id') || queryParams.get('highlight');
    const action = queryParams.get('action');
    if (id) {
      setHighlightedId(id);
      setFilter('ALL');

      const timer = setTimeout(() => {
        const element = document.getElementById(`invoice-card-${id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Eğer URL'de action=pay varsa ve fatura beklemedeyse ödeme modalını otomatik tetikle
        if (action === 'pay' && invoices.length > 0) {
          const found = invoices.find(inv => inv._id === id);
          if (found && found.status === 'Pending') {
            handlePayClick(found);
          }
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
          addToast(t('invoices.pleaseEnterCategoryName'), 'error');
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
        addToast(isEditing ? t('invoices.updateSuccess') : t('invoices.createSuccess'), 'success');
        // Raporlar sayfasının veriyi yenilemesi için event gönder
        window.dispatchEvent(new CustomEvent('invoiceUpdated'));
      }
    } catch (error) {
      addToast(error.message || t('invoices.saveError'), 'error');
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
      dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : new Date(new Date(invoice.date).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
      addToast(t('invoices.invoiceDeletedSuccess'), 'success');
    } catch (error) {
      addToast(error.message || t('invoices.deleteError'), 'error');
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
        addToast(t('invoices.invoicePaidSuccess'), 'success');
        window.dispatchEvent(new CustomEvent('invoiceUpdated'));
      }
    } catch (error) {
      addToast(error.message || t('invoices.paymentError'), 'error');
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
              placeholder={t('invoices.searchPlaceholder')}
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
                {filter === 'ALL' ? t('invoices.filterAll') : filter === 'PENDING' ? t('invoices.filterPending') : t('invoices.filterPaid')}
              </span>
              <span className="dropdown-arrow"></span>
            </button>

            {isFilterDropdownOpen && (
              <div className="dropdown-menu glass-card">
                <div
                  className={`dropdown-item ${filter === 'ALL' ? 'active' : ''}`}
                  onClick={() => { setFilter('ALL'); setIsFilterDropdownOpen(false); }}
                >
                  {t('invoices.filterAll')}
                </div>
                <div
                  className={`dropdown-item ${filter === 'PENDING' ? 'active' : ''}`}
                  onClick={() => { setFilter('PENDING'); setIsFilterDropdownOpen(false); }}
                >
                  {t('invoices.filterPending')}
                </div>
                <div
                  className={`dropdown-item ${filter === 'PAID' ? 'active' : ''}`}
                  onClick={() => { setFilter('PAID'); setIsFilterDropdownOpen(false); }}
                >
                  {t('invoices.filterPaid')}
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
                    <span className="invoice-type">{invoice.category?.name || t('invoices.invoiceTypeDefault')}</span>
                    <span className={`invoice-status status-${(invoice.status || 'pending').toLowerCase()}`}>
                      {invoice.status === 'Pending' ? t('invoices.statusPending') : t('invoices.statusPaid')}
                    </span>
                  </div>
                  <div className="invoice-amount">
                    {apiClient.formatCurrency(invoice.amount)}
                  </div>
                  <div className="invoice-info">
                    <div className="info-row">
                      <span>{t('invoices.invoiceNumber')}:</span>
                      <span className="info-value">{invoice.invoiceNumber || '-'}</span>
                    </div>
                    <div className="info-row">
                      <span>{t('topbar.description')}</span>
                      <span className="info-value">{invoice.description}</span>
                    </div>
                    <div className="info-row">
                      <span>{t('topbar.uploadedBy')}</span>
                      <span className="info-value">
                        {invoice.uploadedBy?.fullname || invoice.uploadedBy?.name || invoice.uploadedBy?.email || t('common.system')}
                      </span>
                    </div>
                    {invoice.status === 'Pending' && (
                      <div className="info-row due-date-row">
                        <span>{t('invoices.dueDateLabel')}:</span>
                        <span className="info-value">
                          {invoice.dueDate ? apiClient.formatDate(invoice.dueDate) : '-'}
                          {(() => {
                            const due = new Date(invoice.dueDate || Date.now() + 14 * 24 * 60 * 60 * 1000);
                            const now = new Date();
                            due.setHours(0,0,0,0);
                            now.setHours(0,0,0,0);
                            const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
                            if (diffDays < 0) {
                              return <span className="due-badge overdue-badge"> ({Math.abs(diffDays)} {t('invoices.daysOverdue')})</span>;
                            } else if (diffDays === 0) {
                              return <span className="due-badge warning-badge"> ({t('invoices.dueToday')})</span>;
                            } else if (diffDays <= 7) {
                              return <span className="due-badge warning-badge"> ({diffDays} {t('invoices.daysLeft')})</span>;
                            } else {
                              return null;
                            }
                          })()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="invoice-card-footer">
                    <span className="invoice-date">
                      {apiClient.formatDate(invoice.date)}
                    </span>
                    <div className="invoice-actions">
                      {invoice.status === 'Pending' && (
                        <button className="action-btn text-btn pay-btn" title={t('invoices.payBtn')} onClick={() => handlePayClick(invoice)}>{t('invoices.payBtn')}</button>
                      )}
                      <button className="action-btn text-btn" title={t('common.edit')} onClick={() => handleEditClick(invoice)}>{t('common.edit')}</button>
                      <button className="action-btn text-btn delete-btn" title={t('common.delete')} onClick={() => handleDeleteClick(invoice)}>{t('common.delete')}</button>
                    </div>
                  </div>
                </div>
              ))}

            {invoices.length === 0 && (
              <div className="glass-card no-invoices">
                <div className="empty-icon">📄</div>
                <h3>{t('invoices.noInvoicesFound')}</h3>
                <p>{t('invoices.noInvoicesDesc')}</p>
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
        title={isEditing ? t('invoices.editInvoice') : t('invoices.addInvoice')}
        onSubmit={handleSubmitInvoice}
        submitText={isEditing ? t('common.update') : t('invoices.saveInvoice')}
        submitClassName="upload-invoice-btn"
        closeOnOverlayClick={false}
      >
        <div className="invoice-upload-form">
          <div className="form-row">
            <FormInput
              label={t('invoices.invoiceNumber')}
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
              placeholder={t('invoices.invoiceNumberPlaceholder')}
            />
            <FormInput
              label={t('invoices.amountLabel')}
              type="number"
              name="amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              step="0.01"
              required
            />
          </div>

          <div className="form-row">
            <FormInput
              label={t('invoices.descriptionLabel')}
              type="text"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('invoices.descriptionPlaceholder')}
              required
            />
            <FormInput
              label={t('invoices.vendorLabel')}
              type="text"
              name="vendor"
              value={formData.vendor || ''}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              placeholder={t('invoices.vendorPlaceholder')}
            />
          </div>

          <div className="form-row">
            <FormInput
              label={t('invoices.dateLabel')}
              type="date"
              name="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <FormInput
              label={t('invoices.dueDateLabel')}
              type="date"
              name="dueDate"
              value={formData.dueDate || ''}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <FormInput
              label={t('invoices.categoryLabel')}
              type="select"
              name="category"
              options={[
                ...categories.map(cat => ({ value: cat._id, label: cat.name })),
                { value: 'other', label: t('invoices.addCustomCategory') }
              ]}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder={t('invoices.selectCategoryPlaceholder')}
            />

            <FormInput
              label={t('invoices.departmentLabel')}
              type="select"
              name="department"
              options={getDepartmentOptions()}
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>

          {formData.category === 'other' && (
            <div className="form-group other-category-group">
              <input
                type="text"
                placeholder={t('invoices.customCategoryPlaceholder')}
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
        title={t('invoices.deleteConfirmTitle')}
        submitText={deleting ? t('common.deleting') : t('common.yesDelete')}
        submitClassName="danger-btn"
        maxWidth="450px"
      >
        <div className="modal-confirm-content">
          <p className="modal-confirm-message">
            {t('invoices.deleteConfirmMessage')} <br />
            <span className="modal-confirm-warning">{t('invoices.cannotBeUndone')}</span>
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
        title={t('invoices.payConfirmTitle')}
        submitText={paying ? t('common.paying') : t('common.yesPay')}
        submitClassName="upload-invoice-btn"
        maxWidth="450px"
      >
        <div className="modal-confirm-content">
          <p className="modal-confirm-message">
            {t('invoices.payConfirmMessage')} <br />
            {invoiceToPay && (
              <span className="modal-confirm-highlight">
                {t('invoices.payConfirmAmount')} {apiClient.formatCurrency(invoiceToPay.amount)}
              </span>
            )}
          </p>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Invoices;
