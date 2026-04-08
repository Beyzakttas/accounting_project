import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Modal from '../components/common/Modal';
import FormInput from '../components/common/FormInput';
import { useToast } from '../contexts/ToastContext';
import apiClient from '../api/apiClient';
import '../assets/css/Invoices.css';

const Invoices = ({ user: propUser, onLogout }) => {
  const [user] = useState({
    name: propUser?.name || localStorage.getItem('userName') || 'Kullanıcı',
    role: propUser?.role || localStorage.getItem('role') || 'USER'
  });

  const { addToast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [activeMenu] = useState('Faturalar');

  // Yeni fatura formu state
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: 'EXPENSE',
    status: 'Pending'
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await apiClient.get('/invoice');
      if (response.success) {
        setInvoices(response.data);
      }
    } catch (error) {
      console.error('Faturalar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/invoice', formData);
      if (response.success) {
        setShowModal(false);
        setFormData({ invoiceNumber: '', description: '', amount: '', date: new Date().toISOString().split('T')[0], type: 'EXPENSE', status: 'Pending' });
        fetchInvoices();
        addToast('Fatura başarıyla oluşturuldu.', 'success');
      }
    } catch (error) {
      addToast(error.message || 'Fatura oluşturulurken bir hata oluştu.', 'error');
    }
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
                  ₺{invoice.amount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
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
                    {new Date(invoice.date).toLocaleDateString('tr-TR')}
                  </span>
                  <div className="invoice-actions">
                    <button className="action-btn text-btn" title="Düzenle">Düzenle</button>
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
        onClose={() => setShowModal(false)}
        title="Yeni Fatura Ekle"
        onSubmit={handleCreateInvoice}
        submitText="Faturayı Kaydet"
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
