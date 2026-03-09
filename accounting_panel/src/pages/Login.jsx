import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

function Login({ setUsername, setRole }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localRole, setLocalRole] = useState('USER');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = data.data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', userData.role);
        localStorage.setItem('userName', userData.fullname);

        if (setUsername) setUsername(userData.fullname);
        if (setRole) setRole(userData.role);

        window.location.href = '/dashboard';
      } else {
        alert("Hata: " + data.message);
      }
    } catch (error) {
      console.error("Bağlantı hatası:", error);
      console.log("Backend ulaşılamadı, demo girişi yapılıyor...");

      localStorage.setItem('role', localRole.toLowerCase());
      localStorage.setItem('userName', email.split('@')[0] || 'Demo Kullanıcı');
      window.location.href = '/dashboard';
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'light' ? '☀️' : '🌙'}
      </button>

      <div className="blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="login-glass-card">
        <div className="login-header">
          <h1 className="login-title">Hoş Geldiniz</h1>
          <p className="login-subtitle">Muhasebe AI Sistemine Giriş Yapın</p>
        </div>

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

          <div className="input-group">
            <label>Rol</label>
            <select
              value={localRole}
              onChange={(e) => setLocalRole(e.target.value)}
            >
              <option value="ADMİN">Admin</option>
              <option value="MANAGER">Yönetici</option>
              <option value="USER">Kullanıcı</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.5rem' }}>
            <Link to="/forgot-password" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '500' }}>
              Şifremi Unuttum
            </Link>
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? <span className="loader"></span> : 'Giriş Yap'}
          </button>
        </form>

        <div className="login-footer" style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <p>Hesabınız yok mu? <Link to="/register" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '600' }}>Kayıt Ol</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;