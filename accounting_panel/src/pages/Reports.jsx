import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useToast } from '../contexts/ToastContext';
import { getInvoiceStats } from '../services/invoiceService';
import { exportToPDF, exportToExcel, exportToWord } from '../services/exportService';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';

/* ──────────────────────────── ExportModal ──────────────────────────── */
const ExportModal = ({ isOpen, onConfirm, onCancel }) => {
  const [filename, setFilename] = useState('Muhasebe_Rapor');
  const [format, setFormat] = useState('pdf');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setFilename('Muhasebe_Rapor');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = filename.trim() || 'Muhasebe_Rapor';
    onConfirm(clean, format);
  };

  const formats = [
    { id: 'pdf', label: 'PDF Raporu', icon: '📜', color: '#10b981' },
    { id: 'xlsx', label: 'Excel Tablosu', icon: '📊', color: '#3b82f6' },
    { id: 'doc', label: 'Word Belgesi', icon: '📝', color: '#6366f1' }
  ];

  return createPortal(
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100000 // Ensure it's above everything including sidebar
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--modal-bg, #1e293b)',
          border: '1px solid var(--glass-border)',
          borderRadius: '24px',
          padding: '2.5rem',
          width: '450px',
          maxWidth: '90vw',
          boxShadow: '0 30px 70px rgba(0,0,0,0.5)',
          animation: 'fadeInScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          position: 'relative'
        }}
      >
        <h3 style={{ margin: '0 0 1.5rem', color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: 800, textAlign: 'center' }}>
          Raporu Dışa Aktar
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem', marginBottom: '2rem' }}>
          {formats.map((f) => (
            <div
              key={f.id}
              onClick={() => setFormat(f.id)}
              style={{
                padding: '1rem 0.5rem',
                borderRadius: '16px',
                border: `2px solid ${format === f.id ? f.color : 'transparent'}`,
                background: format === f.id ? `${f.color}15` : 'rgba(255,255,255,0.03)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{f.icon}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: format === f.id ? f.color : 'var(--text-secondary)' }}>
                {f.label.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.6rem', paddingLeft: '4px' }}>
              Dosya Adı
            </label>
            <input
              ref={inputRef}
              type="text"
              value={filename}
              onChange={e => setFilename(e.target.value)}
              placeholder="Dosya ismini girin..."
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '14px',
                border: '1.5px solid var(--glass-border)',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s',
                boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = formats.find(f => f.id === format).color}
              onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1, padding: '1rem', borderRadius: '14px', border: '1px solid var(--glass-border)',
                background: 'transparent', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', transition: '0.2s'
              }}
            >
              İptal
            </button>
            <button
              type="submit"
              className="primary-btn"
              style={{
                flex: 2, padding: '1rem', borderRadius: '14px', border: 'none',
                background: `linear-gradient(135deg, ${formats.find(f => f.id === format).color}, #6366f1)`,
                color: '#fff', fontWeight: 700, cursor: 'pointer'
              }}
            >
              İndir
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
};

/* ──────────────────────────── Reports Page ──────────────────────────── */
const Reports = ({ user: propUser, onLogout }) => {
  const [user] = useState({
    name: propUser?.name || localStorage.getItem('userName') || 'Kullanıcı',
    role: propUser?.role || localStorage.getItem('role') || 'USER'
  });

  const { addToast } = useToast();
  const [stats, setStats] = useState({
    totalIncome: 0, totalExpense: 0, pendingCount: 0,
    dailyData: [], categoryData: []
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

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
      addToast('PDF raporu hazırlanıyor...', 'success');
    } else if (format === 'xlsx') {
      exportToExcel(stats, filename);
      addToast('Excel tablosu hazırlanıyor...', 'success');
    } else if (format === 'doc') {
      exportToWord(stats, filename);
      addToast('Word dökümanı hazırlanıyor...', 'success');
    }
  };

  const netKar = stats.totalIncome - stats.totalExpense;

  const reportStats = [
    { title: 'Toplam Gelir',       value: `₺${stats.totalIncome.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, isPositive: true },
    { title: 'Toplam Gider',       value: `₺${stats.totalExpense.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, isPositive: false },
    { title: 'Net Kar',            value: `₺${netKar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,             isPositive: netKar >= 0 },
    { title: 'Bekleyen Faturalar', value: stats.pendingCount.toString(),                                                   isPositive: stats.pendingCount === 0 }
  ];

  return (
    <DashboardLayout user={user} activeMenu="Raporlar" onDownloadReport={() => setIsModalOpen(true)} onLogout={onLogout}>
      <ExportModal
        isOpen={isModalOpen}
        onConfirm={handleConfirmExport}
        onCancel={() => setIsModalOpen(false)}
      />

      <div className="reports-container" style={{ color: 'var(--text-primary)' }}>
        {/* Summary Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {reportStats.map((stat, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '1.8rem', borderLeft: `5px solid ${stat.isPositive ? '#10b981' : '#ef4444'}` }}>
              <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.8rem', fontWeight: 600 }}>{stat.title.toUpperCase()}</h3>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
          {/* Daily Chart */}
          <div className="glass-card" style={{ padding: '2rem', minHeight: '450px' }}>
            <h2 style={{ marginBottom: '2rem', fontSize: '1.2rem', fontWeight: 700 }}>Günlük Finansal Analiz</h2>
            <div style={{ width: '100%', height: '320px' }}>
              {stats.dailyData && stats.dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.dailyData}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="dateStr" stroke="var(--text-secondary)" tick={{fontSize: 11}} axisLine={false} tickLine={false} />
                    <YAxis stroke="var(--text-secondary)" tick={{fontSize: 11}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', color: '#fff' }} />
                    <Legend iconType="circle" />
                    <Area type="monotone" dataKey="income" name="Gelir" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="expense" name="Gider" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Veri bekleniyor...</div>
              )}
            </div>
          </div>

          {/* Category Pie */}
          <div className="glass-card" style={{ padding: '2rem', minHeight: '450px' }}>
            <h2 style={{ marginBottom: '2rem', fontSize: '1.2rem', fontWeight: 700 }}>Gider Dağılımı</h2>
            <div style={{ width: '100%', height: '320px' }}>
              {stats.categoryData && stats.categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryData.filter(c => c.type === 'EXPENSE')}
                      cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" nameKey="name"
                    >
                      {stats.categoryData.map((_, i) => <Cell key={i} fill={['#10b981','#3b82f6','#f59e0b','#ef4444','#8b5cf6'][i%5]} />)}
                    </Pie>
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Gider verisi bulunmuyor.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
