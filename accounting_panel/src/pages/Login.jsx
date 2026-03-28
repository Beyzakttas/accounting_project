import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/common/AuthLayout';
import LoadingButton from '../components/common/LoadingButton';
import { useToast } from '../contexts/ToastContext';
import { loginUser } from '../services/authService';
import '../assets/css/Login.css';

function Login({ setUsername, setRole }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
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
        <div className="input-group">
          <label>E-posta</label>
          <div className="input-wrapper">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@sirket.com"
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label>Şifre</label>
          <div className="input-wrapper">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

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