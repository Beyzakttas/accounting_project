import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import { useTheme } from '../contexts/ThemeContext';
import apiClient from '../utils/apiClient';
import '../assets/css/Dashboard.css';
import '../assets/css/StaffManagement.css';

const StaffManagement = ({ user: propUser }) => {
  const [user] = useState({
    name: propUser?.name || localStorage.getItem('userName') || 'Yönetici',
    role: propUser?.role || localStorage.getItem('role') || 'MANAGER'
  });

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeMenu] = useState('Personel Yönetimi');
  const { theme, toggleTheme } = useTheme();

  // Yeni personel formu state
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    department: ''
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await apiClient.get('/owner/staff');
      if (response.success) {
        setStaffList(response.data);
      }
    } catch (error) {
      console.error('Personel listesi yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Güncelleme işlemi
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password; // Şifre boşsa gönderme

        const response = await apiClient.put(`/owner/staff/${editingId}`, updateData);
        if (response.success) {
          setShowModal(false);
          setEditingId(null);
          setFormData({ fullname: '', email: '', password: '', department: '' });
          fetchStaff();
          alert('Personel bilgileri güncellendi.');
        }
      } else {
        // Yeni kayıt işlemi
        if (!formData.password) return alert('Yeni personel için şifre zorunludur.');
        const response = await apiClient.post('/owner/staff', formData);
        if (response.success) {
          setShowModal(false);
          setFormData({ fullname: '', email: '', password: '', department: '' });
          fetchStaff();
          alert('Personel başarıyla eklendi.');
        }
      }
    } catch (error) {
      alert(error.message || 'Bir hata oluştu. Lütfen bilgileri kontrol edin.');
    }
  };

  const handleEditStaff = (staff) => {
    setEditingId(staff._id);
    setFormData({
      fullname: staff.fullname,
      email: staff.email,
      password: '', // Şifreyi boş bırakıyoruz (değiştirmek istemeyebilir)
      department: staff.department || ''
    });
    setShowModal(true);
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Bu personeli silmek istediğinize emin misiniz?')) return;
    try {
      const response = await apiClient.delete(`/owner/staff/${id}`);
      if (response.success) {
        fetchStaff();
        alert('Personel silindi.');
      }
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
      <Sidebar user={user} activeMenu={activeMenu} setActiveMenu={() => { }} />

      <main className="main-area">
        <Topbar
          activeMenu={activeMenu}
          user={user}
          theme={theme}
          toggleTheme={toggleTheme}
          onLogout={onLogout}
        />

        <div className="content-scroll-area">
          <div className="staff-management-container">
            <div className="staff-header">
              <h1>Şirket Personelleri</h1>
              <button className="add-staff-btn" onClick={() => setShowModal(true)}>
                <span>+</span> Yeni Personel Ekle
              </button>
            </div>

            <div className="glass-card staff-table-container">
              {loading ? (
                <div className="loading-state">Yükleniyor...</div>
              ) : (
                <table className="staff-table">
                  <thead>
                    <tr>
                      <th>Ad Soyad</th>
                      <th>E-posta</th>
                      <th>Departman</th>
                      <th>Durum</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffList.map((staff) => (
                      <tr key={staff._id} className="staff-row">
                        <td>{staff.fullname}</td>
                        <td>{staff.email}</td>
                        <td>{staff.department || 'Belirtilmemiş'}</td>
                        <td>
                          <span className={`status-badge ${staff.isActive ? 'active' : 'inactive'}`}>
                            {staff.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <button className="action-btn" title="Düzenle" onClick={() => handleEditStaff(staff)}>✏️</button>
                          <button className="action-btn" title="Sil" onClick={() => handleDeleteStaff(staff._id)}>🗑️</button>
                        </td>
                      </tr>
                    ))}
                    {staffList.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                          Henüz personel eklenmemiş.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="invoice-modal glass-card modal-content" style={{ maxWidth: '800px', width: '90%' }}>
            <div className="modal-header">
              <h2>{editingId ? 'Personel Güncelle' : 'Yeni Personel Ekle'}</h2>
            </div>
            <form onSubmit={handleAddStaff}>
              <div className="form-group">
                <label>Ad Soyad</label>
                <input
                  type="text"
                  required
                  value={formData.fullname}
                  onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                  placeholder="Ahmet Yılmaz"
                />
              </div>
              <div className="form-group">
                <label>E-posta</label>
                <input
                  type="email"
                  required
                  disabled={!!editingId} // E-posta değiştirilemesin (opsiyonel tercih)
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ahmet@sirket.com"
                />
              </div>
              <div className="form-group">
                <label>Şifre {editingId && '(Değiştirmek istemiyorsanız boş bırakın)'}</label>
                <input
                  type="password"
                  required={!editingId}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="form-group">
                <label>Departman</label>
                <select
                  className="modal-select"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                >
                  <option value="" disabled>Departman Seçin</option>
                  <option value="Muhasebe">Muhasebe</option>
                  <option value="Finans">Finans</option>
                  <option value="IK">İnsan Kaynakları</option>
                  <option value="Satis">Satış</option>
                  <option value="Pazarlama">Pazarlama</option>
                  <option value="Yazilim">Yazılım / IT</option>
                  <option value="Operasyon">Operasyon</option>
                  <option value="Diger">Diğer</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => { setShowModal(false); setEditingId(null); setFormData({ fullname: '', email: '', password: '', department: '' }); }}>İptal</button>
                <button type="submit" className="add-staff-btn">{editingId ? 'Güncelle' : 'Personeli Kaydet'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
