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
  const { language } = useLanguage();
  const [stats, setStats] = useState({
    totalIncome: 0, totalExpense: 0, pendingCount: 0,
    dailyData: [], categoryData: [], spenderData: [], vendorData: []
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Kategori sayısı çok fazla olduğunda grafikteki taşmayı önlemek için en büyük 10 kategoriyi gösterip kalanları "Diğer" altında birleştiriyoruz
  const processedCategoryData = React.useMemo(() => {
    if (!stats.categoryData || stats.categoryData.length === 0) return [];

    // 1. Veritabanındaki 'Diger', 'Diğer' gibi isimleri ve belirtilmemişleri yakalayıp tek bir havuzda toplayalım
    const otherNames = ['diger', 'diğer', 'other', 'belirtilmemiş', 'unspecified', 'digerler', 'diğerler'];
    
    let otherSum = 0;
    const cleanCategories = [];

    stats.categoryData.forEach(item => {
      const nameLower = item.name ? item.name.toLowerCase().trim() : '';
      if (otherNames.includes(nameLower) || !item.name) {
        otherSum += (item.value || 0);
      } else {
        cleanCategories.push(item);
      }
    });

    // 2. Temiz kategorileri büyükten küçüğe sıralayalım
    cleanCategories.sort((a, b) => b.value - a.value);

    // 3. İlk 4 temiz kategoriyi alalım (Toplamda Diğer ile birlikte 5 kategori olacak)
    const top4 = cleanCategories.slice(0, 4);

    // 4. 4. kategoriden sonrakileri 'otherSum' içine ekleyelim
    const remainingClean = cleanCategories.slice(4);
    otherSum += remainingClean.reduce((sum, item) => sum + (item.value || 0), 0);

    // 5. Final listeyi oluşturalım (top 4 + 1 "Diğer")
    const result = [...top4];
    if (otherSum > 0 || result.length === 0) {
      result.push({
        name: language === 'tr' ? 'Diğer' : 'Other',
        value: otherSum,
        type: 'EXPENSE',
        status: 'Processed'
      });
    }

    // Listeyi büyüklüğüne göre sıralayarak en estetik şekilde verelim
    return result.sort((a, b) => b.value - a.value);
  }, [stats.categoryData, language]);

  const colors = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

  const totalCategoryValue = React.useMemo(() => {
    if (!processedCategoryData || processedCategoryData.length === 0) return 0;
    return processedCategoryData.reduce((sum, item) => sum + (item.value || 0), 0);
  }, [processedCategoryData]);

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

  const renderCustomChart = (data, title, icon, colorClass, labelClass) => {
    const rawMax = data && data.length > 0 ? Math.max(...data.map(d => d.value)) : 0;
    const maxVal = rawMax > 1000 ? (Math.ceil(rawMax / 1000) * 1000) : (rawMax > 0 ? (Math.ceil(rawMax / 100) * 100) : 100);
    const yLabels = [maxVal, maxVal * 0.75, maxVal * 0.5, maxVal * 0.25, 0];

    return (
      <div className="chart-section glass-card" style={{ zIndex: 1, padding: '1.5rem', minHeight: '450px' }}>
        <div className="card-header" style={{ position: 'relative', zIndex: 5, paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '1.5rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)', fontWeight: '700' }}>
            {icon} {title}
          </h2>
        </div>
        
        {data && data.length > 0 ? (
          <div className="chart-container" style={{ height: '300px', marginTop: '1rem' }}>
            <div className="chart-y-axis" style={{ width: '60px' }}>
              {yLabels.map((val, i) => (
                <span key={i}>₺{val >= 1000 ? (val / 1000).toFixed(1) + 'k' : Math.floor(val)}</span>
              ))}
            </div>

            <div className="chart-main-area" style={{ paddingLeft: '10px' }}>
              {data.map((item, idx) => {
                const heightPct = (item.value / maxVal) * 100;
                
                return (
                  <div key={idx} className="chart-column" style={{ minWidth: 0 }}>
                    <div className="chart-bar-group" style={{ justifyContent: 'center' }}>
                      <div
                        className={`chart-bar ${colorClass}`}
                        style={{ height: `${Math.max(heightPct, 4)}%`, width: '100%', maxWidth: '36px' }}
                        title={`${item.name}\n${language === 'tr' ? 'Tutar' : 'Amount'}: ₺${item.value.toLocaleString('tr-TR')}\n${language === 'tr' ? 'İşlem' : 'Transactions'}: ${item.count}`}
                      >
                        {item.value > 0 && (
                          <span className={`bar-value-label ${labelClass}`} style={{ fontSize: '11px', fontWeight: '800' }}>
                            ₺{item.value >= 1000 ? (item.value / 1000).toFixed(1) + 'k' : item.value}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="chart-x-label" title={item.name} style={{ 
                      marginTop: '12px', 
                      fontWeight: '700',
                      width: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="reports-empty-state" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>{language === 'tr' ? 'Henüz yeterli veri bulunmuyor.' : 'Not enough data yet.'}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout user={user} activeMenu="Raporlar" onDownloadReport={() => setIsModalOpen(true)} onLogout={onLogout}>
      <ExportModal
        isOpen={isModalOpen}
        onConfirm={handleConfirmExport}
        onCancel={() => setIsModalOpen(false)}
        language={language}
      />

      <div className="reports-container">
        
        {/* Corporate & Minimalist Analysis Summary Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1.5rem', 
          marginBottom: '2.5rem' 
        }}>
          {/* Top Spender Card */}
          <div className="glass-card" style={{ 
            padding: '1.5rem', 
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
            border: '1px solid var(--glass-border)',
            background: 'var(--glass-bg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: 0, flex: 1, paddingRight: '8px' }}>
                <span style={{ 
                  fontSize: '1.55rem', 
                  fontWeight: '800', 
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.5px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {stats.spenderData && stats.spenderData.length > 0 ? stats.spenderData[0].name : '-'}
                </span>
                <span style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.92rem', 
                  fontWeight: '500' 
                }}>
                  {language === 'tr' ? 'En Çok Harcayan Personel' : 'Top Spending Staff'}
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                flexShrink: 0
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: 'var(--glass-border)', margin: '1.25rem 0 0.75rem 0' }} />

            <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.88rem' }}>
              <span style={{ color: '#8b5cf6', fontWeight: '700' }}>
                {stats.spenderData && stats.spenderData.length > 0 
                  ? `₺${stats.spenderData[0].value.toLocaleString('tr-TR')} ${language === 'tr' ? 'toplam harcama' : 'total spending'}`
                  : '-'}
              </span>
            </div>
          </div>

          {/* Top Vendor Card */}
          <div className="glass-card" style={{ 
            padding: '1.5rem', 
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
            border: '1px solid var(--glass-border)',
            background: 'var(--glass-bg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: 0, flex: 1, paddingRight: '8px' }}>
                <span style={{ 
                  fontSize: '1.55rem', 
                  fontWeight: '800', 
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.5px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {stats.vendorData && stats.vendorData.length > 0 ? stats.vendorData[0].name : '-'}
                </span>
                <span style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.92rem', 
                  fontWeight: '500' 
                }}>
                  {language === 'tr' ? 'En Çok Alım Yapılan Kurum' : 'Top Supplier Vendor'}
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
                border: '1px solid rgba(16, 185, 129, 0.2)',
                flexShrink: 0
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                  <line x1="9" y1="22" x2="9" y2="16"/>
                  <line x1="15" y1="22" x2="15" y2="16"/>
                  <line x1="9" y1="16" x2="15" y2="16"/>
                </svg>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: 'var(--glass-border)', margin: '1.25rem 0 0.75rem 0' }} />

            <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.88rem' }}>
              <span style={{ color: '#10b981', fontWeight: '700' }}>
                {stats.vendorData && stats.vendorData.length > 0 
                  ? `₺${stats.vendorData[0].value.toLocaleString('tr-TR')} ${language === 'tr' ? 'toplam alım' : 'total supplier purchase'}`
                  : '-'}
              </span>
            </div>
          </div>

          {/* Highest Amount Card */}
          <div className="glass-card" style={{ 
            padding: '1.5rem', 
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
            border: '1px solid var(--glass-border)',
            background: 'var(--glass-bg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: 0, flex: 1, paddingRight: '8px' }}>
                <span style={{ 
                  fontSize: '1.55rem', 
                  fontWeight: '800', 
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.5px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {stats.spenderData && stats.spenderData.length > 0 
                    ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(stats.spenderData[0].value)
                    : '-'}
                </span>
                <span style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.92rem', 
                  fontWeight: '500' 
                }}>
                  {language === 'tr' ? 'En Yüksek Harcama Tutarı' : 'Highest Single Spending'}
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
                border: '1px solid rgba(245, 158, 11, 0.2)',
                flexShrink: 0
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: 'var(--glass-border)', margin: '1.25rem 0 0.75rem 0' }} />

            <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.88rem' }}>
              <span style={{ color: '#f59e0b', fontWeight: '700' }}>
                {language === 'tr' ? 'Tek seferlik en yüksek harcama' : 'Highest single transaction'}
              </span>
            </div>
          </div>
        </div>

        {/* Combined Charts Grid */}
        <div className="reports-charts-grid" style={{ gap: '2rem' }}>
          {/* Daily Chart */}
          <div className="glass-card reports-chart-card">
            <h2 className="reports-chart-title" style={{ fontSize: '1.25rem', fontWeight: '700' }}>{language === 'tr' ? 'Günlük Fatura Analizi' : 'Daily Invoice Analysis'}</h2>
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
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-border)" />
                    <XAxis dataKey="dateStr" stroke="var(--text-secondary)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '15px', border: '1px solid var(--glass-border)', background: 'var(--modal-bg)', color: 'var(--text-primary)' }} />
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

          {/* Category Distribution Progress List */}
          <div className="glass-card reports-chart-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 className="reports-chart-title" style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>
              {language === 'tr' ? 'Gider Dağılımı' : 'Expense Distribution'}
            </h2>
            <div className="reports-chart-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '300px' }}>
              {processedCategoryData && processedCategoryData.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', padding: '0.5rem 0' }}>
                  {processedCategoryData.map((item, idx) => {
                    const pct = totalCategoryValue > 0 ? Math.round((item.value / totalCategoryValue) * 100) : 0;
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '14.5px' }}>
                            {item.name}
                          </span>
                          <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                            <strong style={{ color: 'var(--text-primary)', marginRight: '6px' }}>
                              ₺{item.value.toLocaleString('tr-TR')}
                            </strong>
                            %{pct}
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--glass-border)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${pct}%`, 
                            height: '100%', 
                            backgroundColor: colors[idx % colors.length], 
                            borderRadius: '3px',
                            boxShadow: `0 0 10px ${colors[idx % colors.length]}33`
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="reports-empty-state">{language === 'tr' ? 'Fatura verisi bulunmuyor.' : 'No invoice data found.'}</div>
              )}
            </div>
          </div>

          {/* Personel Chart */}
          {renderCustomChart(
            stats.spenderData, 
            language === 'tr' ? 'Personel Harcama Performansı' : 'Staff Spending Performance', 
            '👥', 
            'bar-expense', 
            'label-expense'
          )}
          
          {/* Kurum Chart */}
          {renderCustomChart(
            stats.vendorData, 
            language === 'tr' ? 'Kurum/Satıcı Tedarik Analizi' : 'Vendor Supply Analysis', 
            '🏢', 
            'bar-income', 
            'label-income'
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
