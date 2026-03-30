import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useTheme } from '../../contexts/ThemeContext';
import '../../assets/css/shared.css';
import '../../assets/css/Dashboard.css'; // Common base for sidebar/topbar styles

const DashboardLayout = ({ 
  children, 
  activeMenu, 
  user, 
  onLogout, 
  onAddInvoice,
  onAddStaff,
  onDownloadReport,
  companies,
  selectedCompanyId,
  setSelectedCompanyId
}) => {
  const { theme, toggleTheme } = useTheme();

  const handleLogout = onLogout || (() => {
    localStorage.clear();
    window.location.href = '/';
  });

  return (
    <div className="dashboard-layout">
      <Sidebar 
        user={user} 
        activeMenu={activeMenu} 
        setActiveMenu={() => {}} 
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
          companies={companies}
          selectedCompanyId={selectedCompanyId}
          setSelectedCompanyId={setSelectedCompanyId}
        />

        <div className="content-scroll-area">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
