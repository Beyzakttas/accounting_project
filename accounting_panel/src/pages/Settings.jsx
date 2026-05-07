import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import DashboardLayout from '../components/layout/DashboardLayout';
import FormInput from '../components/common/FormInput';
import { useToast } from '../contexts/ToastContext';
import apiClient from '../api/apiClient';
import '../assets/css/Settings.css';

const Settings = ({ user, onLogout }) => {
  const { addToast } = useToast();

  const [notifications, setNotifications] = useState({
    invoiceAlerts: true,
    weeklyReport: false,
    securityAlerts: true
  });

  const validationSchema = Yup.object().shape({
    currentPassword: Yup.string().required('Mevcut şifre zorunludur.'),
    newPassword: Yup.string()
      .min(8, 'Şifre en az 8 karakter olmalıdır ve karmaşık olmalıdır.')
      .required('Yeni şifre zorunludur.'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Şifreler eşleşmiyor.')
      .required('Şifre tekrarı zorunludur.')
  });

  const handlePasswordUpdate = async (values, { resetForm, setSubmitting }) => {
    try {
      const response = await apiClient.put('/auth/change-password', {
        oldPassword: values.currentPassword,
        newPassword: values.newPassword
      });

      if (response.success) {
        addToast('Şifreniz başarıyla değiştirildi.', 'success');
        resetForm();
      }
    } catch (error) {
      addToast(error.message || 'Şifre değiştirilirken bir hata oluştu. Eski şifrenizi doğru girdiğinizden ve yeni şifrenizin kurallara uyduğundan emin olun.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    addToast('Bildirim tercihi güncellendi.', 'info');
  };

  const ToggleSwitch = ({ checked, onChange }) => (
    <div className={`toggle-switch ${checked ? 'active' : ''}`} onClick={onChange}>
      <div className="toggle-switch-thumb" />
    </div>
  );

  return (
    <DashboardLayout user={user} activeMenu="Ayarlar" onLogout={onLogout}>
      <div className="settings-container">

        {/* --- ŞİFRE DEĞİŞTİR KARTI --- */}
        <div className="glass-card settings-card">
          <h2 className="settings-card-title">Şifre Değiştir</h2>

          <Formik
            initialValues={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
            validationSchema={validationSchema}
            onSubmit={handlePasswordUpdate}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="settings-form-single">
                  <FormInput
                    name="currentPassword"
                    label="Mevcut Şifre"
                    type="password"
                    required
                  />
                </div>
                
                <div className="settings-form-row">
                  <FormInput
                    name="newPassword"
                    label="Yeni Şifre"
                    type="password"
                    required
                  />
                  <FormInput
                    name="confirmPassword"
                    label="Yeni Şifre (Tekrar)"
                    type="password"
                    required
                  />
                </div>

                <div className="settings-form-actions">
                  <button type="submit" disabled={isSubmitting} className="primary-btn settings-save-btn">
                    {isSubmitting ? 'Kaydediliyor...' : 'Şifreyi Kaydet'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>

        {/* --- BİLDİRİM AYARLARI KARTI --- */}
        <div className="glass-card settings-card">
          <h2 className="settings-card-title">Bildirim Ayarları</h2>

          <div className="notification-list">
            
            {/* Bildirim 1 */}
            <div className="notification-item">
              <div className="notification-text">
                <h4 className="notification-title">Yeni Fatura Bildirimleri</h4>
                <p className="notification-desc">
                  Sisteme yeni bir fatura yüklendiğinde anında e-posta alırsınız.
                </p>
              </div>
              <ToggleSwitch 
                checked={notifications.invoiceAlerts} 
                onChange={() => toggleNotification('invoiceAlerts')} 
              />
            </div>

            <div className="notification-divider"></div>

            {/* Bildirim 2 */}
            <div className="notification-item">
              <div className="notification-text">
                <h4 className="notification-title">Haftalık Finansal Özet</h4>
                <p className="notification-desc">
                  Her Pazartesi sabahı genel finansal durum özeti gönderilir.
                </p>
              </div>
              <ToggleSwitch 
                checked={notifications.weeklyReport} 
                onChange={() => toggleNotification('weeklyReport')} 
              />
            </div>

            <div className="notification-divider"></div>

            {/* Bildirim 3 */}
            <div className="notification-item">
              <div className="notification-text">
                <h4 className="notification-title">Güvenlik ve Giriş Uyarıları</h4>
                <p className="notification-desc">
                  Bilmediğiniz bir tarayıcıdan giriş yapıldığında uyarı alırsınız. (Önerilir)
                </p>
              </div>
              <ToggleSwitch 
                checked={notifications.securityAlerts} 
                onChange={() => toggleNotification('securityAlerts')} 
              />
            </div>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Settings;
