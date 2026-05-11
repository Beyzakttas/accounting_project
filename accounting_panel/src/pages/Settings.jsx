import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import DashboardLayout from '../components/layout/DashboardLayout';
import FormInput from '../components/common/FormInput';
import { useToast } from '../contexts/ToastContext';
import apiClient from '../api/apiClient';
import { useLanguage } from '../contexts/LanguageContext';
import '../assets/css/Settings.css';

const Settings = ({ user, onLogout }) => {
  const { addToast } = useToast();
  const { t, language } = useLanguage();

  const [notifications, setNotifications] = useState({
    invoiceAlerts: true,
    weeklyReport: false,
    securityAlerts: true
  });

  const validationSchema = Yup.object().shape({
    currentPassword: Yup.string().required(language === 'tr' ? 'Mevcut şifre zorunludur.' : 'Current password is required.'),
    newPassword: Yup.string()
      .min(8, language === 'tr' ? 'Şifre en az 8 karakter olmalıdır ve karmaşık olmalıdır.' : 'Password must be at least 8 characters long.')
      .required(language === 'tr' ? 'Yeni şifre zorunludur.' : 'New password is required.'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], language === 'tr' ? 'Şifreler eşleşmiyor.' : 'Passwords do not match.')
      .required(language === 'tr' ? 'Şifre tekrarı zorunludur.' : 'Confirm password is required.')
  });

  const handlePasswordUpdate = async (values, { resetForm, setSubmitting }) => {
    try {
      const response = await apiClient.put('/auth/change-password', {
        oldPassword: values.currentPassword,
        newPassword: values.newPassword
      });

      if (response.success) {
        addToast(language === 'tr' ? 'Şifreniz başarıyla değiştirildi.' : 'Your password has been successfully changed.', 'success');
        resetForm();
      }
    } catch (error) {
      addToast(error.message || (language === 'tr' ? 'Şifre değiştirilirken bir hata oluştu. Eski şifrenizi doğru girdiğinizden ve yeni şifrenizin kurallara uyduğundan emin olun.' : 'An error occurred while changing password. Make sure you entered your current password correctly and your new password meets the requirements.'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    addToast(language === 'tr' ? 'Bildirim tercihi güncellendi.' : 'Notification preference updated.', 'info');
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
          <h2 className="settings-card-title">{language === 'tr' ? 'Şifre Değiştir' : 'Change Password'}</h2>

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
                    label={language === 'tr' ? "Mevcut Şifre" : "Current Password"}
                    type="password"
                    required
                  />
                </div>
                
                <div className="settings-form-row">
                  <FormInput
                    name="newPassword"
                    label={language === 'tr' ? "Yeni Şifre" : "New Password"}
                    type="password"
                    required
                  />
                  <FormInput
                    name="confirmPassword"
                    label={language === 'tr' ? "Yeni Şifre (Tekrar)" : "Confirm New Password"}
                    type="password"
                    required
                  />
                </div>

                <div className="settings-form-actions">
                  <button type="submit" disabled={isSubmitting} className="primary-btn settings-save-btn">
                    {isSubmitting ? (language === 'tr' ? 'Kaydediliyor...' : 'Saving...') : (language === 'tr' ? 'Şifreyi Kaydet' : 'Save Password')}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>

        {/* --- BİLDİRİM AYARLARI KARTI --- */}
        <div className="glass-card settings-card">
          <h2 className="settings-card-title">{language === 'tr' ? 'Bildirim Ayarları' : 'Notification Settings'}</h2>

          <div className="notification-list">
            
            {/* Bildirim 1 */}
            <div className="notification-item">
              <div className="notification-text">
                <h4 className="notification-title">{language === 'tr' ? 'Yeni Fatura Bildirimleri' : 'New Invoice Notifications'}</h4>
                <p className="notification-desc">
                  {language === 'tr' ? 'Sisteme yeni bir fatura yüklendiğinde anında e-posta alırsınız.' : 'Get notified instantly via email when a new invoice is uploaded to the system.'}
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
                <h4 className="notification-title">{language === 'tr' ? 'Haftalık Finansal Özet' : 'Weekly Financial Summary'}</h4>
                <p className="notification-desc">
                  {language === 'tr' ? 'Her Pazartesi sabahı genel finansal durum özeti gönderilir.' : 'A summary of your overall financial status is sent every Monday morning.'}
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
                <h4 className="notification-title">{language === 'tr' ? 'Güvenlik ve Giriş Uyarıları' : 'Security and Login Alerts'}</h4>
                <p className="notification-desc">
                  {language === 'tr' ? 'Bilmediğiniz bir tarayıcıdan giriş yapıldığında uyarı alırsınız. (Önerilir)' : 'Get alerted when a login occurs from an unfamiliar browser. (Recommended)'}
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
