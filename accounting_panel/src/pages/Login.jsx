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

function Login({ setUsername, setRole }) {
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
      const { user: userData, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('role', userData.role);
      localStorage.setItem('userName', userData.fullname);

      if (setUsername) setUsername(userData.fullname);
      if (setRole) setRole(userData.role);

      window.location.href = '/dashboard';
    } catch (error) {
      console.error("Bağlantı hatası:", error);
      addToast("Hata: " + (error.message || "Giriş işlemi başarısız. Sunucuyu kontrol edin."), "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="LOGIN">
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={validationSchema}
        onSubmit={handleLogin}
      >
        {({ isSubmitting }) => (
          <Form className="login-form">
            <FormInput
              name="email"
              label="E-posta"
              type="email"
              placeholder="ornek@sirket.com"
            />

            <FormInput
              name="password"
              label="Şifre"
              type="password"
              placeholder="••••••••"
            />

            <div className="forgot-password-wrapper">
              <Link to="/forgot-password" className="primary-link small">
                Şifremi Unuttum
              </Link>
            </div>

            <LoadingButton isLoading={isSubmitting}>Giriş Yap</LoadingButton>
          </Form>
        )}
      </Formik>

      <div className="login-footer">
        <p>Hesabınız yok mu? <Link to="/register" className="primary-link">Kayıt Ol</Link></p>
      </div>
    </AuthLayout>
  );
}

export default Login;