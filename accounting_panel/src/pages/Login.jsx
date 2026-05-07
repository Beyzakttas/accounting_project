import React from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import AuthLayout from '../components/common/AuthLayout';
import LoadingButton from '../components/common/LoadingButton';
import { useToast } from '../contexts/ToastContext';
import { loginUser } from '../services/authService';
import FormInput from '../components/common/FormInput';
import '../assets/css/Login.css';

function Login({ setUser }) {
  const { addToast } = useToast();

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email('Geçersiz e-posta adresi')
      .required('E-posta alanı zorunludur'),
    password: Yup.string()
      .required('Şifre alanı zorunludur'),
  });

  const handleLogin = async (values, { setSubmitting }) => {
    try {
      const response = await loginUser(values);
      const { user: userData, token } = response.data; // Backend wraps data in a 'data' field

      localStorage.setItem('token', token);
      localStorage.setItem('role', userData.role);
      localStorage.setItem('userName', userData.fullname);
      localStorage.setItem('userId', userData._id);
      localStorage.setItem('department', userData.department || 'Diger');

      if (setUser) {
        setUser({
          name: userData.fullname,
          role: userData.role,
          id: userData._id,
          department: userData.department || 'Diger'
        });
      }

      window.location.href = '/dashboard';
    } catch (error) {
      console.error("Giriş hatası:", error);
      addToast(error.message || "Giriş işlemi başarısız.", "error");
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
        Mali tablolarınızı<br />
        <span>kolayca</span> yönetin
      </h1>

      <p className="left-subtitle">
        Gelir-gider takibi, fatura yönetimi ve vergi raporlamalarını tek platformda birleştirin.
      </p>

      <ul className="left-feature-list">
        <li className="left-feature-item">
          <div className="feature-icon-box">📄</div>
          Otomatik fatura oluşturma
        </li>
        <li className="left-feature-item">
          <div className="feature-icon-box">📊</div>
          Gerçek zamanlı mali raporlar
        </li>
        <li className="left-feature-item">
          <div className="feature-icon-box">🔒</div>
          ISO 27001 güvenlik sertifikası
        </li>
      </ul>
    </>
  );

  return (
    <AuthLayout leftPanelContent={leftPanelContent}>
      <div className="login-header">
        <h1 className="login-title">Hesabınıza giriş yapın</h1>
        <p className="login-subtitle">Devam etmek için bilgilerinizi girin.</p>
      </div>

      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={validationSchema}
        onSubmit={handleLogin}
      >
        {({ isSubmitting }) => (
          <Form className="login-form">
            <FormInput
              name="email"
              label="E-POSTA ADRESİ"
              type="email"
              placeholder="ornek@firma.com"
            />

            <FormInput
              name="password"
              label="ŞİFRE"
              type="password"
              placeholder="••••••••"
            />

            <div className="form-actions-row">
              <label className="remember-me">
                <input type="checkbox" name="rememberMe" />
                <span className="checkmark"></span>
                Beni hatırla
              </label>
              <Link to="/forgot-password" className="auth-border-btn">
                Şifremi unuttum
              </Link>
            </div>

            <LoadingButton isLoading={isSubmitting}>Giriş Yap</LoadingButton>
          </Form>
        )}
      </Formik>

      <div className="login-footer">
        <p>Hesabınız yok mu? <Link to="/register" className="auth-border-btn">Ücretsiz kaydolun</Link></p>
      </div>
    </AuthLayout>
  );
}

export default Login;