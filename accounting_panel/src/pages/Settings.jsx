import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import FormInput from '../components/common/FormInput';
import { useToast } from '../contexts/ToastContext';
import { validatePasswordStrength } from '../utils/ValidationUtils';
import '../assets/css/Settings.css';

const Settings = ({ user: propUser }) => {
  const [user] = useState({
    name: propUser?.name || localStorage.getItem('userName') || 'Kullanıcı',
    role: propUser?.role || localStorage.getItem('role') || 'USER'
  });

  const { addToast } = useToast();

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    invoiceAlerts: true,
    weeklyReport: false,
    securityAlerts: true
  });

  const [errors, setErrors] = useState({});

  const handlePasswordUpdate = (e) => {
    e.preventDefault();

    const passError = validatePasswordStrength(passwordData.newPassword);
    if (passError) {
      setErrors({ ...errors, newPassword: passError });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ ...errors, confirmPassword: 'Şifreler eşleşmiyor.' });
      return;
    }

    setErrors({});
    
    // API çağrısı buraya gelecek
    addToast('Şifreniz başarıyla değiştirildi.', 'success');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
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
    <DashboardLayout user={user} activeMenu="Ayarlar">
      <div className="settings-container">

        {/* --- ŞİFRE DEĞİŞTİR KARTI --- */}
        <div className="glass-card settings-card">
          <h2 className="settings-card-title">Şifre Değiştir</h2>

          <form onSubmit={handlePasswordUpdate}>
            
            <div className="settings-form-single">
              <FormInput
                label="Mevcut Şifre"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
              />
            </div>
            
            <div className="settings-form-row">
              <FormInput
                label="Yeni Şifre"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, newPassword: e.target.value });
                  setErrors({ ...errors, newPassword: '' });
                }}
                error={errors.newPassword}
                required
              />
              <FormInput
                label="Yeni Şifre (Tekrar)"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                  setErrors({ ...errors, confirmPassword: '' });
                }}
                error={errors.confirmPassword}
                required
              />
            </div>

            <div className="settings-form-actions">
              <button type="submit" className="primary-btn settings-save-btn">
                Şifreyi Kaydet
              </button>
            </div>
          </form>
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
