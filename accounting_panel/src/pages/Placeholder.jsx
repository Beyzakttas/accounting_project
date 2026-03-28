import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import { useTheme } from '../contexts/ThemeContext';
import '../assets/css/Dashboard.css';

const Placeholder = ({ title, user: propUser }) => {
  const [user] = useState({
    name: propUser?.name || localStorage.getItem('userName') || 'Kullanıcı',
    role: propUser?.role || localStorage.getItem('role') || 'USER'
  });

  const { theme, toggleTheme } = useTheme();

  const onLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} activeMenu={title} />

      <main className="main-area">
        <Topbar
          activeMenu={title}
          user={user}
          theme={theme}
          toggleTheme={toggleTheme}
          onLogout={onLogout}
        />

        <div className="content-scroll-area">
          <div className="glass-card empty-state" style={{ margin: '2rem', padding: '4rem', textAlign: 'center' }}>
            <div className="empty-icon" style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🚧</div>
            <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>{title} - Yapım Aşamasında</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Bu sayfa yakında eklenecektir. Lütfen daha sonra tekrar kontrol edin.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Placeholder;
