import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useToast } from '../contexts/ToastContext';
import { getInvoiceStats } from '../services/invoiceService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
    dailyData: []
  });

  useEffect(() => {
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
    fetchStats();
  }, []);

  const netKar = stats.totalIncome - stats.totalExpense;

  const reportStats = [
    { title: 'Toplam Gelir', value: `₺${stats.totalIncome.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, trend: 'Gerçek Veri', isPositive: true },
    { title: 'Toplam Gider', value: `₺${stats.totalExpense.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, trend: 'Gerçek Veri', isPositive: false },
    { title: 'Net Kar', value: `₺${netKar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, trend: 'Gerçek Veri', isPositive: netKar >= 0 },
    { title: 'Bekleyen Faturalar', value: stats.pendingCount.toString(), trend: 'Aktif Durum', isPositive: stats.pendingCount === 0 }
  ];

  return (
    <DashboardLayout 
      user={user} 
      activeMenu="Raporlar"
      onDownloadReport={() => addToast('Rapor indirme henüz aktif değil.', 'info')}
      onLogout={onLogout}
    >
      <div className="reports-container">
        {/* Özet Kartları */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {reportStats.map((stat, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '1.5rem', borderLeft: `4px solid ${stat.isPositive ? '#10b981' : '#ef4444'}` }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{stat.title}</h3>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>{stat.value}</div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {stat.trend}
              </div>
            </div>
          ))}
        </div>

        {/* Grafik Alanı */}
        <div className="glass-card" style={{ padding: '2rem', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Günlük Gelir/Gider Analizi</h2>
          <div style={{ flex: 1, width: '100%', height: '350px' }}>
            {stats.dailyData && stats.dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.dailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="dateStr" stroke="var(--text-secondary)" tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-secondary)" tickLine={false} axisLine={false} tickFormatter={(value) => `₺${value > 1000 ? (value/1000).toFixed(0) + 'k' : value}`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    itemStyle={{ fontWeight: 600 }}
                    formatter={(value) => [`₺${value.toLocaleString('tr-TR')}`, '']}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Area type="monotone" dataKey="income" name="Gelir" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expense" name="Gider" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                Henüz yeterli fatura verisi bulunmuyor.
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Reports;
