import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Modal from '../components/common/Modal';
import FormInput from '../components/common/FormInput';
import { useToast } from '../contexts/ToastContext';
import apiClient from '../api/apiClient';
import '../assets/css/StaffManagement.css';

const StaffManagement = ({ user, onLogout }) => {
  const { addToast } = useToast();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeMenu] = useState('Personel Yönetimi');

  const departmentLabels = {
    'Muhasebe': 'Muhasebe',
    'Finans': 'Finans',
    'IK': 'İnsan Kaynakları',
    'Satis': 'Satış',
    'Pazarlama': 'Pazarlama',
    'Yazilim': 'Yazılım / IT',
    'Operasyon': 'Operasyon',
    'Diger': 'Diğer'
  };

  // Yeni personel formu state
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    department: 'Muhasebe'
  });

  const fetchStaff = useCallback(async () => {
    try {
      const response = await apiClient.get('/owner/staff');
      if (response.success) {
        setStaffList(response.data);
      }
    } catch (error) {
      console.error('Personel listesi yüklenemedi:', error);
      addToast('Personel listesi şu an görüntülenemiyor, lütfen sayfanızı yenileyip tekrar deneyin.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

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
          addToast('Personel bilgileri güncellendi.', 'success');
        }
      } else {
        // Yeni kayıt işlemi
        if (!formData.password) return addToast('Yeni personel için şifre zorunludur.', 'warning');
        const response = await apiClient.post('/owner/staff', formData);
        if (response.success) {
          setShowModal(false);
          setFormData({ fullname: '', email: '', password: '', department: 'Muhasebe' });
          fetchStaff();
          addToast('Personel başarıyla eklendi.', 'success');
        }
      }
    } catch (error) {
      addToast(error.message || 'İşleminiz kaydedilemedi, lütfen girdiğiniz bilgilerin doğruluğunu kontrol edin.', 'error');
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

  const handleDeleteClick = (staff) => {
    setStaffToDelete(staff);
    setShowDeleteModal(true);
  };

  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;
    setDeleting(true);
    try {
      const response = await apiClient.delete(`/owner/staff/${staffToDelete._id}`);
      if (response.success) {
        setShowDeleteModal(false);
        setStaffToDelete(null);
        fetchStaff();
        addToast('Personel silindi.', 'success');
      }
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
      onAddStaff={() => setShowModal(true)}
      onLogout={onLogout}
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
                    <td>{departmentLabels[staff.department] || staff.department || 'Belirtilmemiş'}</td>
                    <td>
                      <span className={`status-badge ${staff.isActive ? 'active' : 'inactive'}`}>
                        {staff.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button className="action-btn text-btn" title="Düzenle" onClick={() => handleEditStaff(staff)}>Düzenle</button>
                      <button className="action-btn text-btn delete-btn" title="Sil" onClick={() => handleDeleteClick(staff)}>Sil</button>
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
        closeOnOverlayClick={false}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setStaffToDelete(null);
        }}
        onSubmit={(e) => {
          e.preventDefault();
          handleDeleteStaff();
        }}
        title="Personeli Sil"
        submitText={deleting ? 'Siliniyor...' : 'Evet, Sil'}
        submitClassName="danger-btn"
        maxWidth="450px"
      >
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
            <strong>{staffToDelete?.fullname}</strong> isimli personeli sistemden kalıcı olarak silmek istediğinize emin misiniz? <br />
            <span style={{ color: '#ef4444', fontWeight: '600' }}>Bu işlem geri alınamaz.</span>
          </p>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default StaffManagement;
