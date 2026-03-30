import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Modal from '../components/common/Modal';
import FormInput from '../components/common/FormInput';
import apiClient from '../api/apiClient';
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

  // Yeni personel formu state
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    department: 'Muhasebe'
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
          setFormData({ fullname: '', email: '', password: '', department: 'Muhasebe' });
          fetchStaff();
          alert('Personel bilgileri güncellendi.');
        }
      } else {
        // Yeni kayıt işlemi
        if (!formData.password) return alert('Yeni personel için şifre zorunludur.');
        const response = await apiClient.post('/owner/staff', formData);
        if (response.success) {
          setShowModal(false);
          setFormData({ fullname: '', email: '', password: '', department: 'Muhasebe' });
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
      department: staff.department || 'Muhasebe'
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

  return (
    <DashboardLayout
      user={user}
      activeMenu={activeMenu}
      onAddStaff={() => setShowModal(true)}
    >
      <div className="staff-management-container">
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

      {/* Add Staff Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingId(null);
          setFormData({ fullname: '', email: '', password: '', department: 'Muhasebe' });
        }}
        title={editingId ? 'Personel Güncelle' : 'Yeni Personel Ekle'}
        onSubmit={handleAddStaff}
        submitText={editingId ? 'Güncelle' : 'Personeli Kaydet'}
        submitClassName="add-staff-btn"
      >
        <FormInput
          label="Ad Soyad"
          type="text"
          name="fullname"
          value={formData.fullname}
          onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
          placeholder="Ahmet Yılmaz"
          required
        />
        <FormInput
          label="E-posta"
          type="email"
          name="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="ahmet@sirket.com"
          required
          disabled={!!editingId} // E-posta değiştirilemesin
        />
        <FormInput
          label={`Şifre ${editingId ? '(Değiştirmek istemiyorsanız boş bırakın)' : ''}`}
          type="password"
          name="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="••••••••"
          required={!editingId}
        />
        <FormInput
          label="Departman"
          type="select"
          name="department"
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          required
          options={[
            { value: 'Muhasebe', label: 'Muhasebe' },
            { value: 'Finans', label: 'Finans' },
            { value: 'IK', label: 'İnsan Kaynakları' },
            { value: 'Satis', label: 'Satış' },
            { value: 'Pazarlama', label: 'Pazarlama' },
            { value: 'Yazilim', label: 'Yazılım / IT' },
            { value: 'Operasyon', label: 'Operasyon' },
            { value: 'Diger', label: 'Diğer' }
          ]}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default StaffManagement;
