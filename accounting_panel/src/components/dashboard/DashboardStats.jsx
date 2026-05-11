import React from 'react';
import apiClient from '../../api/apiClient';
import { useLanguage } from '../../contexts/LanguageContext';

const DashboardStats = ({ stats }) => {
  const { t, language } = useLanguage();

  return (
    <div className="stats-grid">
      <div className="stat-card glass-card">
        <div className="stat-icon income">✅</div>
        <div className="stat-details">
          <p className="stat-title">{t('dashboard.income')}</p>
          <h3 className="stat-value">
            {apiClient.formatCurrency(stats.totalIncome)}
          </h3>
          <span className="stat-change positive">
            {language === 'tr' ? 'Toplam ödenen fatura tutarı' : 'Total paid invoice amount'}
          </span>
        </div>
      </div>

      <div className="stat-card glass-card">
        <div className="stat-icon expense">⚠️</div>
        <div className="stat-details">
          <p className="stat-title">{t('dashboard.expense')}</p>
          <h3 className="stat-value">
            {apiClient.formatCurrency(stats.totalExpense)}
          </h3>
          <span className="stat-change negative">
            {language === 'tr' ? 'Toplam bekleyen fatura tutarı' : 'Total pending invoice amount'}
          </span>
        </div>
      </div>

      <div className="stat-card glass-card">
        <div className="stat-icon invoices">📄</div>
        <div className="stat-details">
          <p className="stat-title">{t('dashboard.pendingCount')}</p>
          <h3 className="stat-value">{stats.pendingCount}</h3>
          <span className="stat-change neutral">
            {language === 'tr' ? 'İşlem bekleyen fatura sayısı' : 'Number of invoices waiting for action'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
