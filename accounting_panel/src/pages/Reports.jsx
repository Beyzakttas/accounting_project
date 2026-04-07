import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useToast } from '../contexts/ToastContext';

const Reports = ({ user: propUser, onLogout }) => {
  const [user] = useState({
    name: propUser?.name || localStorage.getItem('userName') || 'Kullanıcı',
    role: propUser?.role || localStorage.getItem('role') || 'USER'
  });

  const { addToast } = useToast();

  // Mock veri - Gerçek uygulamada API'den gelecek
  const reportStats = [
    { title: 'Toplam Gelir', value: '₺145,250.00', trend: '+15%', isPositive: true },
    { title: 'Toplam Gider', value: '₺82,400.00', trend: '-5%', isPositive: true },
    { title: 'Net Kar', value: '₺62,850.00', trend: '+22%', isPositive: true },
    { title: 'Bekleyen Faturalar', value: '12', trend: '+2', isPositive: false }
  ];

  return (
    <DashboardLayout 
      user={user} 
      activeMenu="Raporlar"
      onDownloadReport={() => addToast('Rapor indirme işlemi başlatıldı.', 'info')}
      onLogout={onLogout}
    >
      <div className="reports-container">
        {/* Özet Kartları */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {reportStats.map((stat, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '1.5rem', borderLeft: `4px solid ${stat.isPositive ? '#10b981' : '#ef4444'}` }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{stat.title}</h3>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>{stat.value}</div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: stat.isPositive ? '#10b981' : '#ef4444' }}>
                {stat.trend} (Geçen aya göre)
              </div>
            </div>
          ))}
        </div>

        {/* Grafik Alanı (Placeholder) */}
        <div className="glass-card" style={{ padding: '2rem', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Aylık Gelir/Gider Analizi</h2>
          <div style={{ 
            flex: 1, 
            background: 'rgba(255,255,255,0.02)', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px dashed rgba(255,255,255,0.1)'
          }}>
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📈</span>
              Buraya Recharts veya Chart.js ile dinamik grafik entegre edilecektir.
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Reports;
