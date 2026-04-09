import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useToast } from '../contexts/ToastContext';
import { getInvoiceStats } from '../services/invoiceService';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';

const Reports = ({ user: propUser, onLogout }) => {
  const [user] = useState({
    name: propUser?.name || localStorage.getItem('userName') || 'Kullanıcı',
    role: propUser?.role || localStorage.getItem('role') || 'USER'
  });

  const { addToast } = useToast();
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    pendingCount: 0,
    dailyData: [],
    categoryData: []
  });

  useEffect(() => {
    fetchStats();

    // Sayfa görünür olduğunda veya odaklandığında yenile
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchStats();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', fetchStats);
    // Fatura güncellendiğinde anında yenile
    window.addEventListener('invoiceUpdated', fetchStats);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', fetchStats);
      window.removeEventListener('invoiceUpdated', fetchStats);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getInvoiceStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('İstatistikler alınamadı:', error);
    }
  };

  const netKar = stats.totalIncome - stats.totalExpense;

  const reportStats = [
    { title: 'Toplam Gelir', value: `₺${stats.totalIncome.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, trend: 'Gerçek Veri', isPositive: true },
    { title: 'Toplam Gider', value: `₺${stats.totalExpense.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, trend: 'Gerçek Veri', isPositive: false },
    { title: 'Net Kar', value: `₺${netKar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, trend: 'Gerçek Veri', isPositive: netKar >= 0 },
    { title: 'Bekleyen Faturalar', value: stats.pendingCount.toString(), trend: 'Aktif Durum', isPositive: stats.pendingCount === 0 }
  ];

  const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const expenseData = stats.categoryData
    ? stats.categoryData.filter(c => c.type === 'EXPENSE')
    : [];

  return (
    <DashboardLayout
      user={user}
      activeMenu="Raporlar"
      onDownloadReport={() => addToast('Rapor indirme henüz aktif değil.', 'info')}
      onLogout={onLogout}
    >
      <div className="reports-container" style={{ color: 'var(--text-primary)' }}>
        {/* Özet Kartları */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {reportStats.map((stat, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '1.5rem', borderLeft: `4px solid ${stat.isPositive ? '#10b981' : '#ef4444'}` }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{stat.title}</h3>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stat.value}</div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {stat.trend}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Günlük Analiz */}
          <div className="glass-card" style={{ padding: '1.5rem', minHeight: '400px' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Günlük Gelir/Gider Analizi</h2>
            <div style={{ width: '100%', height: '300px' }}>
              {stats.dailyData && stats.dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
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
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="dateStr" stroke="var(--text-secondary)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₺${v}`} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #eee' }} />
                    <Area type="monotone" dataKey="income" name="Gelir" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="expense" name="Gider" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                  Veri bekleniyor...
                </div>
              )}
            </div>
          </div>

          {/* Kategori Bazlı Dağılım */}
          <div className="glass-card" style={{ padding: '1.5rem', minHeight: '400px' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Gider Dağılımı (Kategori)</h2>
            <div style={{ width: '100%', height: '300px' }}>
              {expenseData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                  Henüz gider kategorisi bulunmuyor.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
