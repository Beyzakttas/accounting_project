import React from 'react';
import apiClient from '../../api/apiClient';
import { useLanguage } from '../../contexts/LanguageContext';

const DashboardStats = ({ stats }) => {
  const { t, language } = useLanguage();

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.5rem',
      marginBottom: '0'
    }}>
      {/* CARD 1: INCOME (PAID) */}
      <div className="glass-card" style={{
        padding: '1.5rem',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
        border: '1px solid var(--glass-border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <span style={{
              fontSize: '1.75rem',
              fontWeight: '800',
              color: 'var(--text-primary)',
              letterSpacing: '-0.5px'
            }}>
              {apiClient.formatCurrency(stats.totalIncome)}
            </span>
            <span style={{
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              {t('dashboard.income')}
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: 'var(--glass-border)', margin: '1.25rem 0 0.75rem 0' }} />

        <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem' }}>
          <span style={{ color: '#10b981', fontWeight: '700' }}>
            +12.5% {language === 'tr' ? 'geçen aya göre' : 'vs Last Month'}
          </span>
        </div>
      </div>

      {/* CARD 2: EXPENSE (PENDING) */}
      <div className="glass-card" style={{
        padding: '1.5rem',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
        border: '1px solid var(--glass-border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <span style={{
              fontSize: '1.75rem',
              fontWeight: '800',
              color: 'var(--text-primary)',
              letterSpacing: '-0.5px'
            }}>
              {apiClient.formatCurrency(stats.totalExpense)}
            </span>
            <span style={{
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              {t('dashboard.expense')}
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: 'var(--glass-border)', margin: '1.25rem 0 0.75rem 0' }} />

        <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem' }}>
          <span style={{ color: '#ef4444', fontWeight: '700' }}>
            -4.2% {language === 'tr' ? 'geçen aya göre' : 'vs Last Month'}
          </span>
        </div>
      </div>

      {/* CARD 3: PENDING COUNT */}
      <div className="glass-card" style={{
        padding: '1.5rem',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
        border: '1px solid var(--glass-border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <span style={{
              fontSize: '1.75rem',
              fontWeight: '800',
              color: 'var(--text-primary)',
              letterSpacing: '-0.5px'
            }}>
              {stats.pendingCount}
            </span>
            <span style={{
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              {t('dashboard.pendingCount')}
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.2)'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <circle cx="12" cy="12" r="2" />
              <path d="M6 12h.01M18 12h.01" />
            </svg>
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: 'var(--glass-border)', margin: '1.25rem 0 0.75rem 0' }} />

        <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem' }}>
          <span style={{ color: '#f59e0b', fontWeight: '700' }}>
            {language === 'tr' ? 'Eylem bekleyenler' : 'Pending review'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
