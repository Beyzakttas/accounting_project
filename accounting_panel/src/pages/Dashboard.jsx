import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { getAllCompanies } from '../services/companyService';
import { getInvoiceStats } from '../services/invoiceService';
import '../assets/css/Dashboard.css';

const Dashboard = ({ user: propUser, onLogout }) => {
  const [user] = useState({
    name: propUser?.name || localStorage.getItem('userName') || 'Demo Kullanıcı',
    role: propUser?.role || localStorage.getItem('role') || 'ADMIN'
  });

  const [activeMenu] = useState('Anasayfa');
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('ALL');
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    pendingCount: 0
  });

  useEffect(() => {
    // Şirketleri getir (Admin ise)
    if (user.role?.toUpperCase() === 'ADMIN') {
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

    // İstatistikleri getir
    const fetchStats = async () => {
      try {
        const response = await getInvoiceStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('İstatistikler alınamadı:', error);
      }
    };
    fetchStats();
  }, [user.role]);

  return (
    <DashboardLayout
      user={user}
      activeMenu={activeMenu}
      companies={companies}
      selectedCompanyId={selectedCompanyId}
      setSelectedCompanyId={setSelectedCompanyId}
      onLogout={onLogout}
    >
      {activeMenu === 'Anasayfa' && (
        <>
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card glass-card">
              <div className="stat-icon income">💰</div>
              <div className="stat-details">
                <p className="stat-title">Toplam Gelir</p>
                <h3 className="stat-value">
                  ₺{stats.totalIncome.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </h3>
                <span className="stat-change positive">Güncel toplam gelir</span>
              </div>
            </div>

            <div className="stat-card glass-card">
              <div className="stat-icon expense">📉</div>
              <div className="stat-details">
                <p className="stat-title">Toplam Gider</p>
                <h3 className="stat-value">
                  ₺{stats.totalExpense.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </h3>
                <span className="stat-change negative">Güncel toplam gider</span>
              </div>
            </div>

            <div className="stat-card glass-card">
              <div className="stat-icon invoices">📄</div>
              <div className="stat-details">
                <p className="stat-title">Bekleyen Faturalar</p>
                <h3 className="stat-value">{stats.pendingCount}</h3>
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
              <div className="chart-placeholder" style={{ height: '300px', width: '100%', marginTop: '1.5rem', display: 'flex', gap: '15px' }}>
                {(() => {
                  const now = new Date();
                  now.setHours(23, 59, 59, 999);

                  const weeklyData = [
                    { label: "4 Hafta Önce", income: 0, expense: 0, minDate: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000), maxDate: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000) },
                    { label: "3 Hafta Önce", income: 0, expense: 0, minDate: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000), maxDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) },
                    { label: "Geçen Hafta", income: 0, expense: 0, minDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), maxDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
                    { label: "Bu Hafta", income: 0, expense: 0, minDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), maxDate: now }
                  ];

                  if (stats.dailyData && stats.dailyData.length > 0) {
                    stats.dailyData.forEach(dayItem => {
                      const [day, month] = dayItem.dateStr.split('/');
                      const year = new Date().getFullYear();
                      const d = new Date(`${year}-${month}-${day}T12:00:00`);

                      if (!isNaN(d)) {
                        for (let week of weeklyData) {
                          if (d > week.minDate && d <= week.maxDate) {
                            week.income += dayItem.income;
                            week.expense += dayItem.expense;
                            break;
                          }
                        }
                      }
                    });
                  }

                  const rawMax = Math.max(...weeklyData.map(w => Math.max(w.income, w.expense)));

                  // Kesin ve temiz yuvarlama (Örn: 619 -> 700, 1450 -> 1600)
                  const maxVal = rawMax > 0 ? (Math.ceil(rawMax / 100) * 100) : 100;
                  const yLabels = [maxVal, maxVal * 0.75, maxVal * 0.5, maxVal * 0.25, 0];

                  return (
                    <>
                      {/* Sol Cetvel */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: '100%',
                        paddingBottom: '30px',
                        color: 'var(--text-secondary)',
                        fontSize: '11px',
                        width: '45px',
                        textAlign: 'right',
                        fontWeight: 700
                      }}>
                        {yLabels.map((val, i) => (
                          <span key={i}>₺{val >= 1000 ? (val / 1000).toFixed(0) + 'k' : Math.floor(val)}</span>
                        ))}
                      </div>

                      {/* Grafik Alanı */}
                      <div className="mock-chart" style={{ flex: 1, display: 'flex', gap: '20px', alignItems: 'flex-end', paddingBottom: '30px', borderBottom: '1px solid var(--glass-border)' }}>
                        {weeklyData.map((week, idx) => {
                          const hInc = (week.income / maxVal) * 100;
                          const hExp = (week.expense / maxVal) * 100;
                          const isEmpty = week.income === 0 && week.expense === 0;

                          return (
                            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-end', opacity: isEmpty ? 0.3 : 1 }}>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', height: '100%', position: 'relative' }}>
                                {/* Gelir Çubuğu */}
                                <div
                                  className="bar"
                                  style={{
                                    height: `${Math.max(hInc, isEmpty ? 0 : 4)}%`,
                                    flex: 1,
                                    background: 'linear-gradient(to top, #10b981, rgba(16, 185, 129, 0.4))',
                                    borderRadius: '8px 8px 0 0',
                                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.1)',
                                    position: 'relative',
                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    cursor: 'pointer',
                                    zIndex: 1
                                  }}
                                  title={`Gelir: ₺${week.income.toLocaleString()}`}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scaleY(1.05) translateY(-5px)';
                                    e.currentTarget.style.filter = 'brightness(1.15) saturate(1.2)';
                                    e.currentTarget.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.4), 0 0 30px rgba(16, 185, 129, 0.1)';
                                    e.currentTarget.style.zIndex = '10';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scaleY(1) translateY(0)';
                                    e.currentTarget.style.filter = 'none';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.1)';
                                    e.currentTarget.style.zIndex = '1';
                                  }}
                                >
                                  {week.income > 0 && (
                                    <span style={{ position: 'absolute', bottom: '100%', left: '0', width: '100%', textAlign: 'center', fontSize: '10px', fontWeight: 800, color: '#10b981', paddingBottom: '8px', textShadow: '0 0 5px rgba(16, 185, 129, 0.2)' }}>
                                      ₺{week.income >= 1000 ? (week.income / 1000).toFixed(1) + 'k' : week.income}
                                    </span>
                                  )}
                                </div>

                                {/* Gider Çubuğu */}
                                <div
                                  className="bar"
                                  style={{
                                    height: `${Math.max(hExp, isEmpty ? 0 : 4)}%`,
                                    flex: 1,
                                    background: 'linear-gradient(to top, #ef4444, rgba(239, 68, 68, 0.4))',
                                    borderRadius: '8px 8px 0 0',
                                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.1)',
                                    position: 'relative',
                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    cursor: 'pointer',
                                    zIndex: 1
                                  }}
                                  title={`Gider: ₺${week.expense.toLocaleString()}`}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scaleY(1.05) translateY(-5px)';
                                    e.currentTarget.style.filter = 'brightness(1.15) saturate(1.2)';
                                    e.currentTarget.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.4), 0 0 30px rgba(239, 68, 68, 0.1)';
                                    e.currentTarget.style.zIndex = '10';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scaleY(1) translateY(0)';
                                    e.currentTarget.style.filter = 'none';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.1)';
                                    e.currentTarget.style.zIndex = '1';
                                  }}
                                >
                                  {week.expense > 0 && (
                                    <span style={{ position: 'absolute', bottom: '100%', left: '0', width: '100%', textAlign: 'center', fontSize: '10px', fontWeight: 800, color: '#ef4444', paddingBottom: '8px', textShadow: '0 0 5px rgba(239, 68, 68, 0.2)' }}>
                                      ₺{week.expense >= 1000 ? (week.expense / 1000).toFixed(1) + 'k' : week.expense}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-secondary)', marginTop: '10px', fontWeight: 700 }}>
                                {week.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
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
    </DashboardLayout>
  );
};

export default Dashboard;