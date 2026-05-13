import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const DashboardAnalysisCharts = ({ spenderData = [], vendorData = [] }) => {
  const { language } = useLanguage();

  const renderCustomChart = (data, title, icon, colorClass, labelClass) => {
    const rawMax = data.length > 0 ? Math.max(...data.map(d => d.value)) : 0;
    // Round to nearest 1000 if large, or nearest 100
    const maxVal = rawMax > 1000 ? (Math.ceil(rawMax / 1000) * 1000) : (rawMax > 0 ? (Math.ceil(rawMax / 100) * 100) : 100);
    const yLabels = [maxVal, maxVal * 0.75, maxVal * 0.5, maxVal * 0.25, 0];

    return (
      <div className="chart-section glass-card" style={{ zIndex: 1, padding: '1.5rem' }}>
        <div className="card-header" style={{ position: 'relative', zIndex: 5, paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '1.5rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', margin: 0, color: 'var(--text-primary)' }}>
            {icon} {title}
          </h2>
        </div>
        
        {data.length > 0 ? (
          <div className="chart-container" style={{ height: '280px' }}>
            {/* Y-Axis Labels */}
            <div className="chart-y-axis" style={{ width: '60px' }}>
              {yLabels.map((val, i) => (
                <span key={i}>₺{val >= 1000 ? (val / 1000).toFixed(1) + 'k' : Math.floor(val)}</span>
              ))}
            </div>

            {/* Main Chart Area */}
            <div className="chart-main-area" style={{ paddingLeft: '10px' }}>
              {data.map((item, idx) => {
                const heightPct = (item.value / maxVal) * 100;
                const shortName = item.name.length > 15 ? item.name.substring(0, 12) + '...' : item.name;
                
                return (
                  <div key={idx} className="chart-column" style={{ minWidth: 0 }}>
                    <div className="chart-bar-group" style={{ justifyContent: 'center' }}>
                      <div
                        className={`chart-bar ${colorClass}`}
                        style={{ height: `${Math.max(heightPct, 4)}%`, width: '100%', maxWidth: '36px' }}
                        title={`${item.name}\n${language === 'tr' ? 'Tutar' : 'Amount'}: ₺${item.value.toLocaleString('tr-TR')}\n${language === 'tr' ? 'İşlem' : 'Transactions'}: ${item.count}`}
                      >
                        {item.value > 0 && (
                          <span className={`bar-value-label ${labelClass}`} style={{ fontSize: '10px', fontWeight: '800' }}>
                            ₺{item.value >= 1000 ? (item.value / 1000).toFixed(1) + 'k' : item.value}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="chart-x-label" title={item.name} style={{ 
                      marginTop: '8px', 
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
          <div className="reports-empty-state" style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>{language === 'tr' ? 'Henüz yeterli veri bulunmuyor.' : 'Not enough data yet.'}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="reports-charts-grid">
      {renderCustomChart(
        spenderData, 
        language === 'tr' ? 'Personel Harcama Performansı' : 'Staff Spending Performance', 
        '👥', 
        'bar-expense', // Red gradient bars
        'label-expense'
      )}
      
      {renderCustomChart(
        vendorData, 
        language === 'tr' ? 'Kurum/Satıcı Tedarik Analizi' : 'Vendor Supply Analysis', 
        '🏢', 
        'bar-income', // Green gradient bars
        'label-income'
      )}
    </div>
  );
};

export default DashboardAnalysisCharts;
