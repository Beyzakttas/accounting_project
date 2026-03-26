import React from 'react';

const Sidebar = ({ user, activeMenu, setActiveMenu }) => {
    const navItems = [
        { id: 'Anasayfa', icon: '🏠', label: 'Dashboard' },
        { id: 'Faturalar', icon: '📄', label: 'Faturalar' },
        { id: 'Raporlar', icon: '📊', label: 'Raporlar', adminOnly: true },
        { id: 'Personel', icon: '👥', label: 'Personel Yönetimi', adminOnly: true },
        { id: 'Ayarlar', icon: '⚙️', label: 'Ayarlar' },
    ];

    return (
        <aside className="glass-sidebar">
            <div className="sidebar-logo">
                <span className="logo-text">Muhasebe AI</span>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => {
                    if (item.adminOnly && !['ADMIN', 'MANAGER'].includes(user.role.toUpperCase())) return null;
                    return (
                        <button
                            key={item.id}
                            className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
                            onClick={() => setActiveMenu(item.id)}
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
