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

      if (setUser) {
        setUser({
          name: userData.fullname,
          role: userData.role
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

  return (
    <AuthLayout title="Login">
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

            <div className="form-actions-row">
              <label className="remember-me">
                <input type="checkbox" name="rememberMe" />
                <span className="checkmark"></span>
                Beni Hatırla
              </label>
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