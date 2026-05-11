import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const DashboardChart = ({ stats }) => {
  const { language } = useLanguage();
  const [viewMode, setViewMode] = useState('weekly');
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const now = new Date();
  now.setHours(23, 59, 59, 999);

  let chartData = [];

  if (viewMode === 'daily') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      chartData.push({ label, income: 0, expense: 0, matchDate: d });
    }
    if (stats.dailyData) {
      stats.dailyData.forEach(item => {
        const d = new Date(item.date);
        const target = chartData.find(c => c.matchDate.getDate() === d.getDate() && c.matchDate.getMonth() === d.getMonth());
        if (target) {
          target.income += item.income;
          target.expense += item.expense;
        }
      });
    }
  } else if (viewMode === 'weekly') {
    chartData = [
      { label: language === 'tr' ? "4 Hafta Önce" : "4 Weeks Ago", income: 0, expense: 0, minDate: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000), maxDate: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000) },
      { label: language === 'tr' ? "3 Hafta Önce" : "3 Weeks Ago", income: 0, expense: 0, minDate: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000), maxDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) },
      { label: language === 'tr' ? "Geçen Hafta" : "Last Week", income: 0, expense: 0, minDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), maxDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
      { label: language === 'tr' ? "Bu Hafta" : "This Week", income: 0, expense: 0, minDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), maxDate: now }
    ];

    if (stats.dailyData && stats.dailyData.length > 0) {
      stats.dailyData.forEach(dayItem => {
        const d = new Date(dayItem.date);

        if (!isNaN(d)) {
          for (let week of chartData) {
            if (d > week.minDate && d <= week.maxDate) {
              week.income += dayItem.income;
              week.expense += dayItem.expense;
              break;
            }
          }
        }
      });
    }
  } else if (viewMode === 'monthly') {
    if (stats.monthlyData && stats.monthlyData.length > 0) {
      chartData = stats.monthlyData.slice(-6).map(m => {
        // Translate monthly labels if needed (e.g. "Oca", "Şub" to "Jan", "Feb")
        let translatedLabel = m.monthStr;
        if (language === 'en') {
          const monthsMap = {
            'Ocak': 'Jan', 'Şubat': 'Feb', 'Mart': 'Mar', 'Nisan': 'Apr', 'Mayıs': 'May', 'Haziran': 'Jun',
            'Temmuz': 'Jul', 'Ağustos': 'Aug', 'Eylül': 'Sep', 'Ekim': 'Oct', 'Kasım': 'Nov', 'Aralık': 'Dec',
            'Oca': 'Jan', 'Şub': 'Feb', 'Mar': 'Mar', 'Nis': 'Apr', 'May': 'May', 'Haz': 'Jun',
            'Tem': 'Jul', 'Ağu': 'Aug', 'Eyl': 'Sep', 'Eki': 'Oct', 'Kas': 'Nov', 'Ara': 'Dec'
          };
          translatedLabel = monthsMap[m.monthStr] || m.monthStr;
        }
        return {
          label: translatedLabel,
          income: m.income,
          expense: m.expense
        };
      });
    } else {
      chartData = [{ label: language === 'tr' ? "Veri Yok" : "No Data", income: 0, expense: 0 }];
    }
  } else if (viewMode === 'yearly') {
    if (stats.monthlyData && stats.monthlyData.length > 0) {
      const yearMap = {};
      stats.monthlyData.forEach(m => {
        if (!yearMap[m.year]) yearMap[m.year] = { label: m.year.toString(), income: 0, expense: 0 };
        yearMap[m.year].income += m.income;
        yearMap[m.year].expense += m.expense;
      });
      chartData = Object.values(yearMap).sort((a, b) => a.label.localeCompare(b.label));
    } else {
      chartData = [{ label: language === 'tr' ? "Veri Yok" : "No Data", income: 0, expense: 0 }];
    }
  }

  const rawMax = chartData.length > 0 ? Math.max(...chartData.map(w => Math.max(w.income, w.expense))) : 0;
  const maxVal = rawMax > 0 ? (Math.ceil(rawMax / 100) * 100) : 100;
  const yLabels = [maxVal, maxVal * 0.75, maxVal * 0.5, maxVal * 0.25, 0];

  let displayTitle = language === 'tr' ? "Ödenen/Bekleyen Fatura Analizi" : "Paid/Pending Invoice Analysis";
  if (viewMode === 'daily') displayTitle = language === 'tr' ? "Günlük Analiz" : "Daily Analysis";
  else if (viewMode === 'weekly') displayTitle = language === 'tr' ? "Haftalık Analiz" : "Weekly Analysis";
  else if (viewMode === 'monthly') displayTitle = language === 'tr' ? "Aylık Analiz" : "Monthly Analysis";
  else if (viewMode === 'yearly') displayTitle = language === 'tr' ? "Yıllık Analiz" : "Yearly Analysis";

  return (
    <div className="chart-section glass-card" style={{ zIndex: 1 }}>
      <div className="card-header" style={{ position: 'relative', zIndex: 5 }}>
        <h2>{displayTitle}</h2>
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button className="icon-btn" onClick={() => setShowMenu(!showMenu)}>⋮</button>
          {showMenu && (
            <div className="dropdown-menu" style={{ 
              position: 'absolute', right: 0, top: '100%', 
              background: 'var(--glass-bg)', 
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '8px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
              padding: '0.5rem', 
              zIndex: 999, 
              minWidth: '120px',
              border: '1px solid var(--glass-border)'
            }}>
              {[
                { id: 'daily', label: language === 'tr' ? 'Günlük' : 'Daily' },
                { id: 'weekly', label: language === 'tr' ? 'Haftalık' : 'Weekly' },
                { id: 'monthly', label: language === 'tr' ? 'Aylık' : 'Monthly' },
                { id: 'yearly', label: language === 'tr' ? 'Yıllık' : 'Yearly' }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => { setViewMode(mode.id); setShowMenu(false); }}
                  style={{
                    display: 'block', width: '100%', padding: '0.5rem 1rem', textAlign: 'left',
                    background: viewMode === mode.id ? 'var(--primary-color-light, rgba(99, 102, 241, 0.15))' : 'transparent',
                    border: 'none', borderRadius: '4px', cursor: 'pointer',
                    color: viewMode === mode.id ? 'var(--primary-color)' : 'var(--text-primary)',
                    fontWeight: viewMode === mode.id ? '600' : '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (viewMode !== mode.id) {
                      e.target.style.background = 'var(--glass-border)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (viewMode !== mode.id) {
                      e.target.style.background = 'transparent';
                    }
                  }}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="chart-container">
        {/* Y-Axis Labels */}
        <div className="chart-y-axis">
          {yLabels.map((val, i) => (
            <span key={i}>₺{val >= 1000 ? (val / 1000).toFixed(0) + 'k' : Math.floor(val)}</span>
          ))}
        </div>

        {/* Main Chart Area */}
        <div className="chart-main-area">
          {chartData.map((dataItem, idx) => {
            const hInc = (dataItem.income / maxVal) * 100;
            const hExp = (dataItem.expense / maxVal) * 100;
            const isEmpty = dataItem.income === 0 && dataItem.expense === 0;

            return (
              <div key={idx} className="chart-column" style={{ opacity: isEmpty ? 0.3 : 1 }}>
                <div className="chart-bar-group">
                  {/* Income Bar */}
                  <div
                    className="chart-bar bar-income"
                    style={{ height: `${Math.max(hInc, isEmpty ? 0 : 4)}%` }}
                    title={`${language === 'tr' ? 'Ödenen' : 'Paid'}: ₺${dataItem.income.toLocaleString()}`}
                  >
                    {dataItem.income > 0 && (
                      <span className="bar-value-label label-income">
                        ₺{dataItem.income >= 1000 ? (dataItem.income / 1000).toFixed(1) + 'k' : dataItem.income}
                      </span>
                    )}
                  </div>

                  {/* Expense Bar */}
                  <div
                    className="chart-bar bar-expense"
                    style={{ height: `${Math.max(hExp, isEmpty ? 0 : 4)}%` }}
                    title={`${language === 'tr' ? 'Bekleyen' : 'Pending'}: ₺${dataItem.expense.toLocaleString()}`}
                  >
                    {dataItem.expense > 0 && (
                      <span className="bar-value-label label-expense">
                        ₺{dataItem.expense >= 1000 ? (dataItem.expense / 1000).toFixed(1) + 'k' : dataItem.expense}
                      </span>
                    )}
                  </div>
                </div>
                <div className="chart-x-label">
                  {dataItem.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardChart;
