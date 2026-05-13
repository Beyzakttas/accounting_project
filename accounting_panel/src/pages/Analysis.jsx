import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { getInvoiceStats } from '../services/invoiceService';
import DashboardAnalysisCharts from '../components/dashboard/DashboardAnalysisCharts';
import { useLanguage } from '../contexts/LanguageContext';
import '../assets/css/Reports.css';

const Analysis = ({ user, onLogout }) => {
  const { language } = useLanguage();
  const [activeMenu] = useState('Analiz');
  const [stats, setStats] = useState({
    spenderData: [],
    vendorData: []
  });

  const fetchStats = useCallback(async () => {
    try {
      const response = await getInvoiceStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('İstatistikler alınamadı:', err);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    const handleUpdate = () => {
      fetchStats();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchStats();
      }
    };

    window.addEventListener('invoiceUpdated', handleUpdate);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', fetchStats);

    // Her 15 saniyede bir otomatik senkronize et
    const interval = setInterval(() => {
      fetchStats();
    }, 15000);

    return () => {
      window.removeEventListener('invoiceUpdated', handleUpdate);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', fetchStats);
      clearInterval(interval);
    };
  }, [fetchStats]);

  return (
    <DashboardLayout
      user={user}
      activeMenu={activeMenu}
      onLogout={onLogout}
    >
      <div style={{ padding: '1.5rem', animation: 'fadeIn 0.6s ease' }}>
        
        {/* Corporate & Minimalist Summary Header */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1.5rem', 
          marginBottom: '2rem' 
        }}>
          {/* Top Spender Card */}
          <div className="glass-card" style={{ 
            padding: '1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1.2rem', 
            background: 'var(--glass-bg)', 
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.2)'
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <span style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '0.75rem', 
                fontWeight: '700', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: '0.2rem'
              }}>
                {language === 'tr' ? 'En Çok Harcayan Personel' : 'Top Spending Staff'}
              </span>
              <div style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                {stats.spenderData?.length > 0 ? stats.spenderData[0].name : '-'}
              </div>
            </div>
          </div>

          {/* Top Vendor Card */}
          <div className="glass-card" style={{ 
            padding: '1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1.2rem', 
            background: 'var(--glass-bg)', 
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                <line x1="9" y1="22" x2="9" y2="16"/>
                <line x1="15" y1="22" x2="15" y2="16"/>
                <line x1="9" y1="16" x2="15" y2="16"/>
                <path d="M8 6h.01"/>
                <path d="M16 6h.01"/>
                <path d="M8 10h.01"/>
                <path d="M16 10h.01"/>
              </svg>
            </div>
            <div>
              <span style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '0.75rem', 
                fontWeight: '700', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: '0.2rem'
              }}>
                {language === 'tr' ? 'En Çok Alım Yapılan Kurum' : 'Top Supplier Vendor'}
              </span>
              <div style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                {stats.vendorData?.length > 0 ? stats.vendorData[0].name : '-'}
              </div>
            </div>
          </div>

          {/* Highest Amount Card */}
          <div className="glass-card" style={{ 
            padding: '1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1.2rem', 
            background: 'var(--glass-bg)', 
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)'
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div>
              <span style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '0.75rem', 
                fontWeight: '700', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: '0.2rem'
              }}>
                {language === 'tr' ? 'En Yüksek Harcama Tutarı' : 'Highest Single Spending'}
              </span>
              <div style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                {stats.spenderData?.length > 0 
                  ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(stats.spenderData[0].value)
                  : '-'}
              </div>
            </div>
          </div>
        </div>

        <DashboardAnalysisCharts spenderData={stats.spenderData} vendorData={stats.vendorData} />
      </div>
    </DashboardLayout>
  );
};

export default Analysis;
