import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ user, activeMenu }) => {
    const navigate = useNavigate();
    const navItems = [
        { id: 'Anasayfa', icon: '🏠', label: 'Dashboard', path: '/dashboard' },
        { id: 'Faturalar', icon: '📄', label: 'Faturalar', path: '/invoices' },
        { id: 'Raporlar', icon: '📊', label: 'Raporlar', adminOnly: true, path: '/reports' },
        { id: 'Personel Yönetimi', icon: '👥', label: 'Personel', adminOnly: true, path: '/staff' },
        { id: 'Ayarlar', icon: '⚙️', label: 'Ayarlar', path: '/settings' },
    ];

    return (
        <aside className="glass-sidebar">
            <div className="sidebar-logo">
                <span className="logo-text">Muhasebe AI</span>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => {
                    const isManagerOrAdmin = ['ADMIN', 'MANAGER'].includes(user.role?.toUpperCase());
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
                    <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
                    <div className="user-info">
                        <span className="user-name">{user.name}</span>
                        <span className="user-role">{user.role.toUpperCase()}</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
