import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useToast } from '../contexts/ToastContext';
import { getInvoiceStats } from '../services/invoiceService';
import apiClient from '../api/apiClient';
import { exportToPDF, exportToExcel, exportToWord } from '../services/exportService';
import { useLanguage } from '../contexts/LanguageContext';
import '../assets/css/Reports.css';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';

/* ──────────────────────────── ExportModal ──────────────────────────── */
const ExportModal = ({ isOpen, onConfirm, onCancel, language }) => {
  const [filename, setFilename] = useState(language === 'tr' ? 'Muhasebe_Rapor' : 'Accounting_Report');
  const [format, setFormat] = useState('pdf');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setFilename(language === 'tr' ? 'Muhasebe_Rapor' : 'Accounting_Report');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, language]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = filename.trim() || (language === 'tr' ? 'Muhasebe_Rapor' : 'Accounting_Report');
    onConfirm(clean, format);
  };

  const formats = [
    { id: 'pdf', label: language === 'tr' ? 'PDF Raporu' : 'PDF Report', short: 'PDF', icon: '📜', color: '#10b981' },
    { id: 'xlsx', label: language === 'tr' ? 'Excel Tablosu' : 'Excel Sheet', short: 'Excel', icon: '📊', color: '#3b82f6' },
    { id: 'doc', label: language === 'tr' ? 'Word Belgesi' : 'Word Document', short: 'Word', icon: '📝', color: '#6366f1' }
  ];

  return createPortal(
    <div className="export-modal-overlay" onClick={onCancel}>
      <div className="export-modal-content" onClick={e => e.stopPropagation()}>
        <h3 className="export-modal-title">{language === 'tr' ? 'Raporu Dışa Aktar' : 'Export Report'}</h3>

        <div className="export-format-grid">
          {formats.map((f) => (
            <div
              key={f.id}
              className={`export-format-option ${format === f.id ? 'active' : ''}`}
              onClick={() => setFormat(f.id)}
              style={{
                borderColor: format === f.id ? f.color : 'transparent',
                background: format === f.id ? `${f.color}15` : undefined
              }}
            >
              <span className="export-format-icon">{f.icon}</span>
              <span className="export-format-label" style={{ color: format === f.id ? f.color : undefined }}>
                {f.short}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="export-field-group">
            <label className="export-field-label">{language === 'tr' ? 'Dosya Adı' : 'File Name'}</label>
            <input
              ref={inputRef}
              type="text"
              className="export-field-input"
              value={filename}
              onChange={e => setFilename(e.target.value)}
              placeholder={language === 'tr' ? "Dosya ismini girin..." : "Enter file name..."}
              onFocus={e => e.target.style.borderColor = formats.find(f => f.id === format).color}
              onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
            />
          </div>

          <div className="export-actions">
            <button type="button" className="export-cancel-btn" onClick={onCancel}>
              {language === 'tr' ? 'İptal' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="export-submit-btn"
              style={{ background: `linear-gradient(135deg, ${formats.find(f => f.id === format).color}, #6366f1)` }}
            >
              {language === 'tr' ? 'İndir' : 'Download'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

/* ──────────────────────────── Reports Page ──────────────────────────── */
const Reports = ({ user, onLogout }) => {
  const { addToast } = useToast();
  const { t, language } = useLanguage();
  const [stats, setStats] = useState({
    totalIncome: 0, totalExpense: 0, pendingCount: 0,
    dailyData: [], categoryData: []
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Kategori sayısı çok fazla olduğunda grafikteki taşmayı önlemek için en büyük 10 kategoriyi gösterip kalanları "Diğer" altında birleştiriyoruz
  const processedCategoryData = React.useMemo(() => {
    if (!stats.categoryData || stats.categoryData.length === 0) return [];

    // Büyükten küçüğe sırala
    const sorted = [...stats.categoryData].sort((a, b) => b.value - a.value);

    if (sorted.length <= 10) return sorted;

    const top9 = sorted.slice(0, 9);
    const remaining = sorted.slice(9);
    const otherValue = remaining.reduce((sum, item) => sum + (item.value || 0), 0);

    return [
      ...top9,
      {
        name: language === 'tr' ? 'Diğer' : 'Other',
        value: otherValue,
        type: 'EXPENSE',
        status: 'Processed'
      }
    ];
  }, [stats.categoryData, language]);

  useEffect(() => {
    fetchStats();
    const handleVisibility = () => { if (document.visibilityState === 'visible') fetchStats(); };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', fetchStats);
    window.addEventListener('invoiceUpdated', fetchStats);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', fetchStats);
      window.removeEventListener('invoiceUpdated', fetchStats);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const res = await getInvoiceStats();
      if (res.success) setStats(res.data);
    } catch (err) {
      console.error('İstatistikler alınamadı:', err);
    }
  };

  const handleConfirmExport = (filename, format) => {
    setIsModalOpen(false);

    if (format === 'pdf') {
      exportToPDF(stats, filename);
      addToast(language === 'tr' ? 'PDF raporu hazırlanıyor...' : 'PDF report is being prepared...', 'success');
    } else if (format === 'xlsx') {
      exportToExcel(stats, filename);
      addToast(language === 'tr' ? 'Excel tablosu hazırlanıyor...' : 'Excel sheet is being prepared...', 'success');
    } else if (format === 'doc') {
      exportToWord(stats, filename);
      addToast(language === 'tr' ? 'Word dökümanı hazırlanıyor...' : 'Word document is being prepared...', 'success');
    }
  };

  const totalInvoices = stats.totalIncome + stats.totalExpense;

  const reportStats = [
    { title: t('dashboard.income'), value: apiClient.formatCurrency(stats.totalIncome), isPositive: true },
    { title: t('dashboard.expense'), value: apiClient.formatCurrency(stats.totalExpense), isPositive: false },
    { title: language === 'tr' ? 'Toplam Faturalar' : 'Total Invoices', value: apiClient.formatCurrency(totalInvoices), isPositive: true, isNeutral: true },
    { title: t('dashboard.pendingCount'), value: stats.pendingCount.toString(), isPositive: stats.pendingCount === 0 }
  ];

  return (
    <DashboardLayout user={user} activeMenu="Raporlar" onDownloadReport={() => setIsModalOpen(true)} onLogout={onLogout}>
      <ExportModal
        isOpen={isModalOpen}
        onConfirm={handleConfirmExport}
        onCancel={() => setIsModalOpen(false)}
        language={language}
      />

      <div className="reports-container">
        {/* Summary Grid */}
        <div className="reports-summary-grid">
          {reportStats.map((stat, idx) => (
            <div key={idx} className="glass-card reports-stat-card" style={{ borderLeft: `5px solid ${stat.isNeutral ? '#6366f1' : stat.isPositive ? '#10b981' : '#ef4444'}` }}>
              <h3 className="reports-stat-title">{stat.title.toUpperCase()}</h3>
              <div className="reports-stat-value">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="reports-charts-grid">
          {/* Daily Chart */}
          <div className="glass-card reports-chart-card">
            <h2 className="reports-chart-title">{language === 'tr' ? 'Günlük Fatura Analizi' : 'Daily Invoice Analysis'}</h2>
            <div className="reports-chart-area">
              {stats.dailyData && stats.dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                  <AreaChart data={stats.dailyData}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="dateStr" stroke="var(--text-secondary)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', color: '#fff' }} />
                    <Legend iconType="circle" />
                    <Area type="monotone" dataKey="income" name={language === 'tr' ? 'Ödenen' : 'Paid'} stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="expense" name={language === 'tr' ? 'Bekleyen' : 'Pending'} stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="reports-empty-state">{language === 'tr' ? 'Veri bekleniyor...' : 'Awaiting data...'}</div>
              )}
            </div>
          </div>

          {/* Category Pie */}
          <div className="glass-card reports-chart-card">
            <h2 className="reports-chart-title">{language === 'tr' ? 'Kategori Bazlı Fatura Dağılımı' : 'Category-Based Invoice Distribution'}</h2>
            <div className="reports-chart-area">
              {processedCategoryData && processedCategoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                  <PieChart>
                    <Pie
                      data={processedCategoryData}
                      cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" nameKey="name"
                    >
                      {processedCategoryData.map((_, i) => <Cell key={i} fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5]} />)}
                    </Pie>
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="reports-empty-state">{language === 'tr' ? 'Fatura verisi bulunmuyor.' : 'No invoice data found.'}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
