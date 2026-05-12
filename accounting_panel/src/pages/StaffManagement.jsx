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
  const { t, language, getDepartmentOptions } = useLanguage();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeMenu] = useState('Personel Yönetimi');

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
      addToast(t('staff.errorLoadingStaff'), 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, t]);

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
          addToast(t('staff.updateStaffSuccess'), 'success');
        }
      } else {
        // Yeni kayıt işlemi
        if (!formData.password) return addToast(t('staff.passwordRequired'), 'warning');
        const response = await apiClient.post('/owner/staff', formData);
        if (response.success) {
          setShowModal(false);
          setFormData({ fullname: '', email: '', password: '', department: 'Muhasebe' });
          fetchStaff();
          addToast(t('staff.addStaffSuccess'), 'success');
        }
      }
    } catch (error) {
      addToast(error.message || t('staff.saveError'), 'error');
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
        addToast(t('staff.deleteStaffSuccess'), 'success');
      }
    } catch (error) {
      addToast(error.message || t('invoices.deleteError'), 'error');
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
                  <th>{t('staff.fullname')}</th>
                  <th>{t('staff.email')}</th>
                  <th>{t('staff.department')}</th>
                  <th>{t('staff.status')}</th>
                  <th>{t('staff.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff) => (
                  <tr key={staff._id} className="staff-row">
                    <td>{staff.fullname}</td>
                    <td>{staff.email}</td>
                    <td>{t(`departments.${staff.department}`) || staff.department || t('common.unspecified')}</td>
                    <td>
                      <span className={`status-badge ${staff.isActive ? 'active' : 'inactive'}`}>
                        {staff.isActive ? t('staff.active') : t('staff.passive')}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button className="action-btn text-btn" title={t('common.edit')} onClick={() => handleEditStaff(staff)}>{t('common.edit')}</button>
                      <button className="action-btn text-btn delete-btn" title={t('common.delete')} onClick={() => handleDeleteClick(staff)}>{t('common.delete')}</button>
                    </td>
                  </tr>
                ))}
                {staffList.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                      {t('staff.noStaffAdded')}
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
        title={editingId ? t('staff.updateStaffTitle') : t('staff.addStaff')}
        onSubmit={handleAddStaff}
        submitText={editingId ? t('common.update') : t('common.save')}
        submitClassName="add-staff-btn"
        closeOnOverlayClick={false}
      >
        <FormInput
          label={t('staff.fullname')}
          type="text"
          name="fullname"
          value={formData.fullname}
          onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
          placeholder={t('staff.fullnamePlaceholder')}
          required
        />
        <FormInput
          label={t('staff.email')}
          type="email"
          name="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder={t('staff.emailPlaceholder')}
          required
          disabled={!!editingId} // E-posta değiştirilemesin
        />
        <FormInput
          label={editingId ? t('staff.passwordLabelEdit') : t('staff.passwordLabelNew')}
          type="password"
          name="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="••••••••"
          required={!editingId}
        />
        <FormInput
          label={t('staff.department')}
          type="select"
          name="department"
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          required
          options={getDepartmentOptions()}
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
        title={t('staff.deleteStaffTitle')}
        submitText={deleting ? t('common.deleting') : t('common.yesDelete')}
        submitClassName="danger-btn"
        maxWidth="450px"
      >
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
            {language === 'tr' ? (
              <>
                <strong>{staffToDelete?.fullname}</strong> {t('staff.deleteConfirmMessage')} <br />
              </>
            ) : (
              <>
                {t('staff.deleteConfirmMessage')} <strong>{staffToDelete?.fullname}</strong>? <br />
              </>
            )}
            <span style={{ color: '#ef4444', fontWeight: '600' }}>{t('invoices.cannotBeUndone')}</span>
          </p>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default StaffManagement;
