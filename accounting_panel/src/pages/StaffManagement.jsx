import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Modal from '../components/common/Modal';
import FormInput from '../components/common/FormInput';
import { useToast } from '../contexts/ToastContext';
import apiClient from '../api/apiClient';
import { useLanguage } from '../contexts/LanguageContext';
import '../assets/css/StaffManagement.css';

const StaffManagement = ({ user, onLogout }) => {
  const { addToast } = useToast();
  const { t, language } = useLanguage();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeMenu] = useState('Personel Yönetimi');

  const departmentLabels = {
    'Muhasebe': language === 'tr' ? 'Muhasebe' : 'Accounting',
    'Finans': language === 'tr' ? 'Finans' : 'Finance',
    'IK': language === 'tr' ? 'İnsan Kaynakları' : 'Human Resources',
    'Satis': language === 'tr' ? 'Satış' : 'Sales',
    'Pazarlama': language === 'tr' ? 'Pazarlama' : 'Marketing',
    'Yazilim': language === 'tr' ? 'Yazılım / IT' : 'Software / IT',
    'Operasyon': language === 'tr' ? 'Operasyon' : 'Operations',
    'Diger': language === 'tr' ? 'Diğer' : 'Other'
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
      addToast(language === 'tr' ? 'Personel listesi şu an görüntülenemiyor, lütfen sayfanızı yenileyip tekrar deneyin.' : 'Staff list is currently unavailable, please refresh the page and try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, language]);

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
          addToast(language === 'tr' ? 'Personel bilgileri güncellendi.' : 'Staff information updated.', 'success');
        }
      } else {
        // Yeni kayıt işlemi
        if (!formData.password) return addToast(language === 'tr' ? 'Yeni personel için şifre zorunludur.' : 'Password is required for new staff.', 'warning');
        const response = await apiClient.post('/owner/staff', formData);
        if (response.success) {
          setShowModal(false);
          setFormData({ fullname: '', email: '', password: '', department: 'Muhasebe' });
          fetchStaff();
          addToast(language === 'tr' ? 'Personel başarıyla eklendi.' : 'Staff successfully added.', 'success');
        }
      }
    } catch (error) {
      addToast(error.message || (language === 'tr' ? 'İşleminiz kaydedilemedi, lütfen girdiğiniz bilgilerin doğruluğunu kontrol edin.' : 'Your transaction could not be saved, please check the correctness of your information.'), 'error');
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
        addToast(language === 'tr' ? 'Personel silindi.' : 'Staff deleted.', 'success');
      }
    } catch (error) {
      addToast(error.message || (language === 'tr' ? 'Silme işlemi başarısız.' : 'Deletion failed.'), 'error');
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
            <div className="loading-state">{t('common.loading')}</div>
          ) : (
            <table className="staff-table">
              <thead>
                <tr>
                  <th>{language === 'tr' ? 'Ad Soyad' : 'Full Name'}</th>
                  <th>{language === 'tr' ? 'E-posta' : 'Email'}</th>
                  <th>{language === 'tr' ? 'Departman' : 'Department'}</th>
                  <th>{language === 'tr' ? 'Durum' : 'Status'}</th>
                  <th>{language === 'tr' ? 'İşlemler' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff) => (
                  <tr key={staff._id} className="staff-row">
                    <td>{staff.fullname}</td>
                    <td>{staff.email}</td>
                    <td>{departmentLabels[staff.department] || staff.department || (language === 'tr' ? 'Belirtilmemiş' : 'Not Specified')}</td>
                    <td>
                      <span className={`status-badge ${staff.isActive ? 'active' : 'inactive'}`}>
                        {staff.isActive ? (language === 'tr' ? 'Aktif' : 'Active') : (language === 'tr' ? 'Pasif' : 'Inactive')}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button className="action-btn text-btn" title={language === 'tr' ? 'Düzenle' : 'Edit'} onClick={() => handleEditStaff(staff)}>{language === 'tr' ? 'Düzenle' : 'Edit'}</button>
                      <button className="action-btn text-btn delete-btn" title={language === 'tr' ? 'Sil' : 'Delete'} onClick={() => handleDeleteClick(staff)}>{language === 'tr' ? 'Sil' : 'Delete'}</button>
                    </td>
                  </tr>
                ))}
                {staffList.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                      {language === 'tr' ? 'Henüz personel eklenmemiş.' : 'No staff has been added yet.'}
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
        title={editingId ? (language === 'tr' ? 'Personel Güncelle' : 'Update Staff') : (language === 'tr' ? 'Yeni Personel Ekle' : 'Add New Staff')}
        onSubmit={handleAddStaff}
        submitText={editingId ? (language === 'tr' ? 'Güncelle' : 'Update') : (language === 'tr' ? 'Personeli Kaydet' : 'Save Staff')}
        submitClassName="add-staff-btn"
        closeOnOverlayClick={false}
      >
        <FormInput
          label={language === 'tr' ? "Ad Soyad" : "Full Name"}
          type="text"
          name="fullname"
          value={formData.fullname}
          onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
          placeholder={language === 'tr' ? "Ahmet Yılmaz" : "John Doe"}
          required
        />
        <FormInput
          label={language === 'tr' ? "E-posta" : "Email"}
          type="email"
          name="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder={language === 'tr' ? "ahmet@sirket.com" : "john@company.com"}
          required
          disabled={!!editingId} // E-posta değiştirilemesin
        />
        <FormInput
          label={language === 'tr' ? `Şifre ${editingId ? '(Değiştirmek istemiyorsanız boş bırakın)' : ''}` : `Password ${editingId ? '(Leave blank if you do not want to change)' : ''}`}
          type="password"
          name="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="••••••••"
          required={!editingId}
        />
        <FormInput
          label={language === 'tr' ? "Departman" : "Department"}
          type="select"
          name="department"
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          required
          options={[
            { value: 'Muhasebe', label: language === 'tr' ? 'Muhasebe' : 'Accounting' },
            { value: 'Finans', label: language === 'tr' ? 'Finans' : 'Finance' },
            { value: 'IK', label: language === 'tr' ? 'İnsan Kaynakları' : 'Human Resources' },
            { value: 'Satis', label: language === 'tr' ? 'Satış' : 'Sales' },
            { value: 'Pazarlama', label: language === 'tr' ? 'Pazarlama' : 'Marketing' },
            { value: 'Yazilim', label: language === 'tr' ? 'Yazılım / IT' : 'Software / IT' },
            { value: 'Operasyon', label: language === 'tr' ? 'Operasyon' : 'Operations' },
            { value: 'Diger', label: language === 'tr' ? 'Diğer' : 'Other' }
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
        title={language === 'tr' ? "Personeli Sil" : "Delete Staff"}
        submitText={deleting ? (language === 'tr' ? 'Siliniyor...' : 'Deleting...') : (language === 'tr' ? 'Evet, Sil' : 'Yes, Delete')}
        submitClassName="danger-btn"
        maxWidth="450px"
      >
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
            {language === 'tr' ? (
              <>
                <strong>{staffToDelete?.fullname}</strong> isimli personeli sistemden kalıcı olarak silmek istediğinize emin misiniz? <br />
                <span style={{ color: '#ef4444', fontWeight: '600' }}>Bu işlem geri alınamaz.</span>
              </>
            ) : (
              <>
                Are you sure you want to permanently delete the staff member named <strong>{staffToDelete?.fullname}</strong>? <br />
                <span style={{ color: '#ef4444', fontWeight: '600' }}>This action cannot be undone.</span>
              </>
            )}
          </p>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default StaffManagement;
