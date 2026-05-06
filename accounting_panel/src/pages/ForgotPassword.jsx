import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import AuthLayout from '../components/common/AuthLayout';
import LoadingButton from '../components/common/LoadingButton';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/authService';
import FormInput from '../components/common/FormInput';
import '../assets/css/Login.css';

function ForgotPassword() {
    const validationSchema = Yup.object().shape({
        email: Yup.string()
            .email("Lütfen geçerli bir e-posta adresi giriniz.")
            .required("E-posta alanı zorunludur.")
    });

    const handleSubmit = async (values, { setSubmitting, setStatus }) => {
        try {
            const data = await forgotPassword(values.email);
            setStatus({ success: data.message });
        } catch (err) {
            setStatus({ error: err.message || "Sunucuya bağlanılamadı." });
        } finally {
            setSubmitting(false);
        }
    };

  const leftPanelContent = (
    <>
      <div className="left-brand-header">
        Finans Pro
      </div>

      <h1 className="left-main-title">
        Güvenli erişim<br />
        <span>her zaman</span> önceliğimiz
      </h1>

      <p className="left-subtitle" style={{ marginBottom: '8rem' }}>
        Hesabınızı doğrulanmış e-posta adresiniz üzerinden kurtarabilirsiniz.
      </p>

      <div className="left-stats-row">
        <div className="stat-item">
          <h3>12.400+</h3>
          <p>AKTİF<br />FİRMA</p>
        </div>
        <div className="stat-item">
          <h3>99.8%</h3>
          <p>KESİNTİ<br />YOK</p>
        </div>
        <div className="stat-item">
          <h3 style={{ color: '#10b981' }}>ISO</h3>
          <p>27001</p>
        </div>
      </div>
    </>
  );

  return (
    <AuthLayout leftPanelContent={leftPanelContent}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" className="auth-border-btn">
          <span>←</span> Geri dön
        </Link>
      </div>

      <div className="login-header">
        <h1 className="login-title">Şifrenizi sıfırlayın</h1>
        <p className="login-subtitle" style={{ maxWidth: '80%' }}>Kayıtlı e-posta adresinizi girin, sıfırlama bağlantısını göndereceğiz.</p>
      </div>

      <Formik
        initialValues={{ email: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, status }) => (
          <Form className="login-form">
            <FormInput
              name="email"
              label="E-POSTA ADRESİ"
              type="email"
              placeholder="ornek@firma.com"
            />

            {status?.success && <p className="success-message">{status.success}</p>}
            {status?.error && <p className="error-message">{status.error}</p>}

            <LoadingButton isLoading={isSubmitting}>Sıfırlama Bağlantısı Gönder</LoadingButton>
          </Form>
        )}
      </Formik>

      <div className="login-footer" style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>Şifrenizi hatırladınız mı?</span>
        <Link to="/" className="auth-border-btn">
          Giriş yapın
        </Link>
      </div>
    </AuthLayout>
  );
}

export default ForgotPassword;
