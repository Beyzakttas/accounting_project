import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

const Sidebar = ({ user, activeMenu, isOpen, onClose }) => {
    const navigate = useNavigate();
    const { t, language } = useLanguage();

    const navItems = [
        { 
            id: 'Anasayfa', 
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, 
            label: t('sidebar.dashboard'), 
            path: '/dashboard' 
        },
        { 
            id: 'Faturalar', 
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>, 
            label: t('sidebar.invoices'), 
            path: '/invoices' 
        },
        { 
            id: 'Raporlar', 
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>, 
            label: t('sidebar.reports') || (language === 'tr' ? 'Raporlar & Analiz' : 'Reports & Analysis'), 
            path: '/reports' 
        },
        { 
            id: 'Personel Yönetimi', 
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, 
            label: t('sidebar.staff'), 
            adminOnly: true, 
            path: '/staff' 
        },
        { 
            id: 'Ayarlar', 
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>, 
            label: t('sidebar.settings'), 
            path: '/settings' 
        },
    ];

    return (
        <aside className={`glass-sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-logo">
                <div style={{ background: '#ffffff', color: '#0f172a', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, marginLeft: '12px' }}>
                    <span className="logo-text" style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff' }}>Muhasebe AI</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{language === 'tr' ? 'Finansal Platform' : 'Financial Platform'}</span>
                </div>
                <button className="sidebar-close-btn" onClick={onClose} title={language === 'tr' ? "Menüyü Kapat" : "Close Menu"}>
                    ✕
                </button>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => {
                    const isManagerOrAdmin = ['ADMIN', 'MANAGER'].includes(user?.role?.toUpperCase());
                    if (item.adminOnly && !isManagerOrAdmin) return null;

                    return (
                        <button
                            key={item.id}
                            className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}
                        >
                            <span className="nav-icon" style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile" style={{ marginBottom: '1.25rem' }}>
                    <div className="avatar">{(user?.name || 'U')?.charAt(0).toUpperCase()}</div>
                    <div className="user-info">
                        <span className="user-name">{user?.name || (language === 'tr' ? 'Kullanıcı' : 'User')}</span>
                        <span className="user-role">{(user?.role || 'USER').toUpperCase()}</span>
                    </div>
                </div>
                <button 
                    className="logout-sidebar-btn" 
                    onClick={() => {
                        window.location.href = '/login';
                    }}
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        width: '100%', 
                        padding: '10px 14px', 
                        border: 'none', 
                        background: 'transparent', 
                        color: '#94a3b8', 
                        borderRadius: '12px', 
                        cursor: 'pointer', 
                        fontWeight: '600', 
                        fontSize: '0.95rem',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                        e.currentTarget.style.color = '#ef4444';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#94a3b8';
                    }}
                    title={language === 'tr' ? 'Çıkış Yap' : 'Logout'}
                >
                    <span className="nav-icon" style={{ display: 'flex', alignItems: 'center' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    </span>
                    <span className="nav-label">{language === 'tr' ? 'Çıkış Yap' : 'Logout'}</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
