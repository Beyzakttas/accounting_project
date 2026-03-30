import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/common/AuthLayout';
import LoadingButton from '../components/common/LoadingButton';
import { useToast } from '../contexts/ToastContext';
import { loginUser } from '../services/authService';
import FormInput from '../components/common/FormInput';
import { validateEmail, validateRequired, validateForm } from '../utils/ValidationUtils';
import '../assets/css/Login.css';

function Login({ setUsername, setRole }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validasyon kontrolü
    const { isValid, errors: validationErrors } = validateForm(
      { email, password },
      { 
        email: validateEmail, 
        password: (val) => validateRequired(val, "Şifre") 
      }
    );

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await loginUser({ email, password });
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
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="LOGIN">
      <form onSubmit={handleLogin} className="login-form">
        <FormInput
          label="E-posta"
          type="email"
          name="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors({ ...errors, email: '' });
          }}
          placeholder="ornek@sirket.com"
          error={errors.email}
        />

        <FormInput
          label="Şifre"
          type="password"
          name="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors({ ...errors, password: '' });
          }}
          placeholder="••••••••"
          error={errors.password}
        />

        <div className="forgot-password-wrapper">
          <Link to="/forgot-password" className="primary-link small">
            Şifremi Unuttum
          </Link>
        </div>

        <LoadingButton isLoading={isLoading}>Giriş Yap</LoadingButton>
      </form>

      <div className="login-footer">
        <p>Hesabınız yok mu? <Link to="/register" className="primary-link">Kayıt Ol</Link></p>
      </div>
    </AuthLayout>
  );
}

export default Login;