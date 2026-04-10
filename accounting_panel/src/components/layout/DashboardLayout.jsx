import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useTheme } from '../../contexts/ThemeContext';
import '../../assets/css/shared.css';
import '../../assets/css/Dashboard.css'; // Common base for sidebar/topbar styles

const DashboardLayout = ({ 
  children, 
  activeMenu, 
  user: propUser, 
  onLogout, 
  onAddInvoice,
  onAddStaff,
  onDownloadReport,
}) => {
  // Kullanıcı bilgisini merkezileştir (Sayfalardan kodu temizlemek için)
  const user = {
    name: propUser?.name || localStorage.getItem('userName') || 'Kullanıcı',
    role: propUser?.role || localStorage.getItem('role') || 'USER'
  };

  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Sayfa değiştiğinde mobilde menüyü kapat
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = onLogout || (() => {
    localStorage.clear();
    window.location.href = '/';
  });

  return (
    <div className={`dashboard-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <Sidebar 
        user={user} 
        activeMenu={activeMenu} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="main-area">
        <Topbar
          activeMenu={activeMenu}
          user={user}
          theme={theme}
          toggleTheme={toggleTheme}
          onLogout={handleLogout}
          onAddInvoice={onAddInvoice}
          onAddStaff={onAddStaff}
          onDownloadReport={onDownloadReport}
          onMenuClick={toggleSidebar}
        />

        <div className="content-scroll-area">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
