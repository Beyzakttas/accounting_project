import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ user, activeMenu, isOpen, onClose }) => {
    const navigate = useNavigate();
    const navItems = [
        { id: 'Anasayfa', icon: '🏠', label: 'Dashboard', path: '/dashboard' },
        { id: 'Faturalar', icon: '📄', label: 'Faturalar', path: '/invoices' },
        { id: 'Raporlar', icon: '📊', label: 'Raporlar', adminOnly: true, path: '/reports' },
        { id: 'Personel Yönetimi', icon: '👥', label: 'Personel', adminOnly: true, path: '/staff' },
        { id: 'Ayarlar', icon: '⚙️', label: 'Ayarlar', path: '/settings' },
    ];

    return (
        <aside className={`glass-sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-logo">
                <span className="logo-text">Muhasebe AI</span>
                <button className="sidebar-close-btn" onClick={onClose} title="Menüyü Kapat">
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
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="avatar">{(user?.name || 'K')?.charAt(0).toUpperCase()}</div>
                    <div className="user-info">
                        <span className="user-name">{user?.name || 'Kullanıcı'}</span>
                        <span className="user-role">{(user?.role || 'USER').toUpperCase()}</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
