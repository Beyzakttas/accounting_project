import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';

const Placeholder = ({ title, user: propUser }) => {
  const [user] = useState({
    name: propUser?.name || localStorage.getItem('userName') || 'Kullanıcı',
    role: propUser?.role || localStorage.getItem('role') || 'USER'
  });

  return (
    <DashboardLayout user={user} activeMenu={title}>
      <div className="glass-card empty-state" style={{ padding: '4rem', textAlign: 'center' }}>
        <div className="empty-icon" style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🚧</div>
        <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>{title} - Yapım Aşamasında</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Bu sayfa yakında eklenecektir. Lütfen daha sonra tekrar kontrol edin.</p>
      </div>
    </DashboardLayout>
  );
};

export default Placeholder;
