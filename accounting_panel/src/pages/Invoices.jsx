import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Modal from '../components/common/Modal';
import FormInput from '../components/common/FormInput';
import apiClient from '../api/apiClient';
import '../assets/css/Invoices.css';

const Invoices = ({ user: propUser }) => {
  const [user] = useState({
    name: propUser?.name || localStorage.getItem('userName') || 'Kullanıcı',
    role: propUser?.role || localStorage.getItem('role') || 'USER'
  });

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeMenu] = useState('Faturalar');

  // Yeni fatura formu state
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Gider',
    status: 'Beklemede'
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
        setFormData({ invoiceNumber: '', description: '', amount: '', date: new Date().toISOString().split('T')[0], type: 'Gider', status: 'Beklemede' });
        fetchInvoices();
        alert('Fatura başarıyla oluşturuldu.');
      }
    } catch (error) {
      alert(error.message || 'Fatura oluşturulurken bir hata oluştu.');
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm('Bu faturayı silmek istediğinize emin misiniz?')) return;
    try {
      await apiClient.delete(`/invoice/${id}`);
      fetchInvoices();
    } catch (error) {
      alert(error.message || 'Silme işlemi başarısız.');
    }
  };

  return (
    <DashboardLayout
      user={user}
      activeMenu={activeMenu}
      onAddInvoice={() => setShowModal(true)}
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
                    <button className="action-btn" title="Düzenle">✏️</button>
                    <button className="action-btn" title="Sil" onClick={() => handleDeleteInvoice(invoice._id)}>🗑️</button>
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
                { value: 'Gider', label: 'Gider' },
                { value: 'Gelir', label: 'Gelir' }
              ]}
            />
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Invoices;
