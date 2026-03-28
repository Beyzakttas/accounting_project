import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import { useTheme } from '../contexts/ThemeContext';
import apiClient from '../utils/apiClient';
import '../assets/css/Dashboard.css';
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
  const { theme, toggleTheme } = useTheme();

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

  const onLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} activeMenu={activeMenu} />

      <main className="main-area">
        <Topbar
          activeMenu={activeMenu}
          user={user}
          theme={theme}
          toggleTheme={toggleTheme}
          onLogout={onLogout}
          onAddInvoice={() => setShowModal(true)}
        />

        <div className="content-scroll-area">
          <div className="invoices-container">
            <div className="invoices-header">
              <h1>Fatura Yönetimi</h1>
            </div>

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
        </div>
      </main>

      {/* Upload/Create Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="invoice-modal glass-card" style={{ maxWidth: '800px', width: '90%' }}>
            <div className="modal-header">
              <h2>Yeni Fatura Ekle</h2>
            </div>
            <form onSubmit={handleCreateInvoice} className="invoice-upload-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Fatura No</label>
                  <input
                    type="text"
                    required
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    placeholder="INV-2024-001"
                  />
                </div>
                <div className="form-group">
                  <label>Tutar (₺)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Açıklama</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Hizmet bedeli, Amazon alımı vb."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tarih</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Tip</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="glass-input"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '0.8rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', width: '100%' }}
                  >
                    <option value="Gider">Gider</option>
                    <option value="Gelir">Gelir</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>İptal</button>
                <button type="submit" className="upload-invoice-btn">Faturayı Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
