import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [user] = useState({
    name: localStorage.getItem('userName') || 'Demo Kullanıcı',
    role: localStorage.getItem('role') || 'admin'
  });

  const [activeMenu, setActiveMenu] = useState('Anasayfa');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const onLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const navItems = [
    { id: 'Anasayfa', icon: '🏠', label: 'Dashboard' },
    { id: 'Faturalar', icon: '📄', label: 'Faturalar' },
    { id: 'Raporlar', icon: '📊', label: 'Raporlar', adminOnly: true },
    { id: 'Personel', icon: '👥', label: 'Personel Yönetimi', adminOnly: true },
    { id: 'Ayarlar', icon: '⚙️', label: 'Ayarlar' },
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="glass-sidebar">
        <div className="sidebar-logo">
          <span className="logo-text">Muhasebe AI</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            if (item.adminOnly && !['admin', 'owner'].includes(user.role)) return null;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
                onClick={() => setActiveMenu(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role.toUpperCase()}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            <span className="logout-icon">🚪</span>
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-area">
        <header className="topbar">
          <div className="page-title">
            <h1>{activeMenu}</h1>
            <p>Sistemin genel durumu ve özet bilgiler.</p>
          </div>

          <div className="topbar-actions">
            <button className="action-btn" onClick={toggleTheme} title="Tema Değiştir">
              {theme === 'light' ? '☀️' : '🌙'}
            </button>
            <button className="action-btn">🔔<span className="badge">3</span></button>
            <button className="primary-btn">+ Yeni Fatura</button>
          </div>
        </header>

        <div className="content-scroll-area">
          {activeMenu === 'Anasayfa' && (
            <>
              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card glass-card">
                  <div className="stat-icon income">💰</div>
                  <div className="stat-details">
                    <p className="stat-title">Toplam Gelir</p>
                    <h3 className="stat-value">₺124,500.00</h3>
                    <span className="stat-change positive">↑ 12.5% geçen aydan</span>
                  </div>
                </div>

                <div className="stat-card glass-card">
                  <div className="stat-icon expense">📉</div>
                  <div className="stat-details">
                    <p className="stat-title">Toplam Gider</p>
                    <h3 className="stat-value">₺42,200.00</h3>
                    <span className="stat-change negative">↓ 4.1% geçen aydan</span>
                  </div>
                </div>

                <div className="stat-card glass-card">
                  <div className="stat-icon invoices">📄</div>
                  <div className="stat-details">
                    <p className="stat-title">Bekleyen Faturalar</p>
                    <h3 className="stat-value">14</h3>
                    <span className="stat-change neutral">İncelenmeyi bekliyor</span>
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div className="dashboard-grid">
                <div className="chart-section glass-card">
                  <div className="card-header">
                    <h2>Gelir/Gider Analizi</h2>
                    <button className="icon-btn">⋮</button>
                  </div>
                  <div className="chart-placeholder">
                    <div className="mock-chart">
                      <div className="bar b1" style={{ height: '60%' }}></div>
                      <div className="bar b2" style={{ height: '80%' }}></div>
                      <div className="bar b3" style={{ height: '40%' }}></div>
                      <div className="bar b4" style={{ height: '90%' }}></div>
                      <div className="bar b5" style={{ height: '50%' }}></div>
                      <div className="bar b6" style={{ height: '75%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="recent-activity glass-card">
                  <div className="card-header">
                    <h2>Yapay Zeka Fatura Analizi</h2>
                  </div>
                  <div className="ai-upload-area">
                    <div className="upload-icon">☁️</div>
                    <p className="upload-text">Faturanızı sürükleyin veya <span className="highlight">dosya seçin</span></p>
                    <p className="upload-sub">PDF, JPG, PNG (Max. 10MB)</p>
                    <button className="upload-btn">Bilgisayardan Seç</button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeMenu !== 'Anasayfa' && (
            <div className="glass-card empty-state">
              <div className="empty-icon">🚧</div>
              <h2>Yapım Aşamasında</h2>
              <p>{activeMenu} sayfası yakında eklenecek.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;