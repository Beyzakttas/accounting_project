import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Modal from '../components/common/Modal';
import FormInput from '../components/common/FormInput';
import { useToast } from '../contexts/ToastContext';
import apiClient from '../api/apiClient';
import '../assets/css/Invoices.css';

const Invoices = ({ user, onLogout }) => {
  const { addToast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [activeMenu] = useState('Faturalar');
  const [customCategoryName, setCustomCategoryName] = useState('');

  // Form state
  const resetForm = () => {
    setFormData({
      invoiceNumber: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      type: 'EXPENSE',
      status: 'Pending',
      category: ''
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
    category: ''
  });

  const fetchCategories = useCallback(async () => {
    try {
      const response = await apiClient.get('/category');
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Kategoriler yüklenemedi:', error);
      addToast('Kategoriler yüklenirken bir hata oluştu.', 'error');
    }
  }, [addToast]);

  const fetchInvoices = useCallback(async () => {
    try {
      const response = await apiClient.get('/invoice');
      if (response.success) {
        setInvoices(response.data);
      }
    } catch (error) {
      console.error('Faturalar yüklenemedi:', error);
      addToast('Faturalar yüklenirken bir hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchInvoices();
    fetchCategories();
  }, [fetchInvoices, fetchCategories]);

  const handleSubmitInvoice = async (e) => {
    e.preventDefault();
    try {
      let categoryId = formData.category;

      // Kullanıcı "Diğer" seçtiyse, önce yeni kategoriyi oluştur
      if (formData.category === 'other') {
        if (!customCategoryName.trim()) {
          addToast('Lütfen kategori adı girin.', 'error');
          return;
        }
        const catResponse = await apiClient.post('/category', { name: customCategoryName.trim() });
        if (catResponse.success) {
          categoryId = catResponse.data._id;
          setCategories(prev => [...prev, catResponse.data]);
        }
      }

      const invoicePayload = { ...formData, category: categoryId || null };
      let response;
      if (isEditing) {
        response = await apiClient.put(`/invoice/${editingInvoiceId}`, invoicePayload);
      } else {
        response = await apiClient.post('/invoice', invoicePayload);
      }

      if (response.success) {
        setShowModal(false);
        resetForm();
        fetchInvoices();
        addToast(isEditing ? 'Fatura başarıyla güncellendi.' : 'Fatura başarıyla oluşturuldu.', 'success');
        // Raporlar sayfasının veriyi yenilemesi için event gönder
        window.dispatchEvent(new CustomEvent('invoiceUpdated'));
      }
    } catch (error) {
      addToast(error.message || 'İşlem sırasında bir hata oluştu.', 'error');
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
      category: invoice.category?._id || invoice.category || ''
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
      fetchInvoices();
      addToast('Fatura başarıyla silindi.', 'success');
    } catch (error) {
      addToast(error.message || 'Silme işlemi başarısız.', 'error');
    } finally {
      setDeleting(false);
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
        {loading ? (
          <div className="loading-state">Yükleniyor...</div>
        ) : (
          <div className="invoice-grid">
            {invoices.map((invoice) => (
              <div key={invoice._id} className="glass-card invoice-card">
                <div className="invoice-card-header">
                  <span className="invoice-type">{invoice.type || 'Fatura'}</span>
                  <span className={`invoice-status status-${(invoice.status || 'pending').toLowerCase()}`}>
                    {invoice.status || 'Beklemede'}
                  </span>
                </div>
                <div className="invoice-amount">
                  {apiClient.formatCurrency(invoice.amount)}
                </div>
                <div className="invoice-info">
                  <div className="info-row">
                    <span>No:</span>
                    <span className="info-value">{invoice.invoiceNumber || '-'}</span>
                  </div>
                  <div className="info-row">
                    <span>Açıklama:</span>
                    <span className="info-value">{invoice.description}</span>
                  </div>
                  <div className="info-row">
                    <span>Yükleyen:</span>
                    <span className="info-value">{invoice.uploadedBy?.fullname || 'Sistem'}</span>
                  </div>
                </div>
                <div className="invoice-card-footer">
                   <span className="invoice-date">
                    {apiClient.formatDate(invoice.date)}
                  </span>
                  <div className="invoice-actions">
                    <button className="action-btn text-btn" title="Düzenle" onClick={() => handleEditClick(invoice)}>Düzenle</button>
                    <button className="action-btn text-btn delete-btn" title="Sil" onClick={() => handleDeleteClick(invoice)}>Sil</button>
                  </div>
                </div>
              </div>
            ))}

            {invoices.length === 0 && (
              <div className="glass-card no-invoices">
                <div className="empty-icon">📄</div>
                <h3>Fatura Bulunmuyor</h3>
                <p>Henüz sisteme fatura eklenmemiş.</p>
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
        title={isEditing ? "Faturayı Düzenle" : "Yeni Fatura Ekle"}
        onSubmit={handleSubmitInvoice}
        submitText={isEditing ? "Güncelle" : "Faturayı Kaydet"}
        submitClassName="upload-invoice-btn"
        closeOnOverlayClick={false}
      >
        <div className="invoice-upload-form">
          <div className="form-row">
            <FormInput
              label="Fatura No"
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
              placeholder="INV-2024-001"
              required
            />
            <FormInput
              label="Tutar (₺)"
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
            label="Açıklama"
            type="text"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Hizmet bedeli, Amazon alımı vb."
            required
          />

          <div className="form-row">
            <FormInput
              label="Tarih"
              type="date"
              name="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <FormInput
              label="Tip"
              type="select"
              name="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { value: 'EXPENSE', label: 'Gider' },
                { value: 'INCOME', label: 'Gelir' }
              ]}
            />
          </div>

          <div className="form-group">
            <FormInput
              label="Kategori"
              type="select"
              name="category"
              options={[
                ...categories.map(cat => ({ value: cat._id, label: cat.name })),
                { value: 'other', label: '+ Diğer (Yeni Kategori Ekle)' }
              ]}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="-- Kategori Seçin --"
            />

            {formData.category === 'other' && (
              <input
                type="text"
                placeholder="Yeni kategori adı girin..."
                value={customCategoryName}
                onChange={(e) => setCustomCategoryName(e.target.value)}
                style={{
                  marginTop: '0.5rem',
                  width: '100%',
                  padding: '0.6rem 0.9rem',
                  borderRadius: '8px',
                  border: '1px solid #10b981',
                  background: 'var(--input-bg, var(--glass-bg))',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            )}
          </div>
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
        title="Faturayı Sil"
        submitText={deleting ? 'Siliniyor...' : 'Evet, Sil'}
        submitClassName="danger-btn"
        maxWidth="450px"
      >
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Seçili faturayı sistemden kalıcı olarak silmek istediğinize emin misiniz? <br />
            <span style={{ color: '#ef4444', fontWeight: '600' }}>Bu işlem geri alınamaz.</span>
          </p>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Invoices;
