import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import '../assets/css/Dashboard.css';
import { getAllCompanies } from '../services/companyService';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const Dashboard = ({ user: propUser }) => {
  const [user] = useState({
    name: propUser?.name || localStorage.getItem('userName') || 'Demo Kullanıcı',
    role: propUser?.role || localStorage.getItem('role') || 'ADMIN'
  });

  const [activeMenu, setActiveMenu] = useState('Anasayfa');
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('ALL');
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (user.role.toUpperCase() === 'ADMIN') {
      const fetchCompanies = async () => {
        try {
          const data = await getAllCompanies();
          setCompanies(data);
        } catch (error) {
          console.error('Şirketler listesi alınamadı:', error);
        }
      };
      fetchCompanies();
    }
  }, [user.role]);

  const onLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <Sidebar
        user={user}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      {/* Main Content */}
      <main className="main-area">
        <Topbar
          activeMenu={activeMenu}
          user={user}
          companies={companies}
          selectedCompanyId={selectedCompanyId}
          setSelectedCompanyId={setSelectedCompanyId}
          theme={theme}
          toggleTheme={toggleTheme}
          onLogout={onLogout}
        />

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