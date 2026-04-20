import React from 'react';
import apiClient from '../../api/apiClient';

const DashboardStats = ({ stats }) => {
  return (
    <div className="stats-grid">
      <div className="stat-card glass-card">
        <div className="stat-icon income">💰</div>
        <div className="stat-details">
          <p className="stat-title">Toplam Gelir</p>
          <h3 className="stat-value">
            {apiClient.formatCurrency(stats.totalIncome)}
          </h3>
          <span className="stat-change positive">Güncel toplam gelir</span>
        </div>
      </div>

      <div className="stat-card glass-card">
        <div className="stat-icon expense">📉</div>
        <div className="stat-details">
          <p className="stat-title">Toplam Gider</p>
          <h3 className="stat-value">
            {apiClient.formatCurrency(stats.totalExpense)}
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
  );
};

export default DashboardStats;
