import React, { useState, useEffect, useRef } from 'react';

const Topbar = ({
    activeMenu,
    user,
    theme,
    toggleTheme,
    onLogout,
    onAddInvoice,
    onAddStaff,
    onDownloadReport,
    onMenuClick
}) => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef(null);

    const loadNotifications = () => {
        const list = JSON.parse(localStorage.getItem('in_app_notifications') || '[]');
        setNotifications(list);
    };

    useEffect(() => {
        loadNotifications();

        const handleNewNotification = () => {
            loadNotifications();
        };

        window.addEventListener('newNotification', handleNewNotification);
        return () => {
            window.removeEventListener('newNotification', handleNewNotification);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleMarkAllRead = () => {
        const updated = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updated);
        localStorage.setItem('in_app_notifications', JSON.stringify(updated));
        setIsOpen(false);
    };

    const handleNotificationClick = (id) => {
        const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
        setNotifications(updated);
        localStorage.setItem('in_app_notifications', JSON.stringify(updated));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const getSubtitle = () => {
        switch (activeMenu) {
            case 'Anasayfa': return 'Sistemin genel durumu ve özet bilgiler.';
            case 'Personel Yönetimi': return 'Şirket çalışanlarını görüntüleyin ve yönetin.';
            case 'Faturalar': return 'Sisteme yüklenen faturaları inceleyin ve yönetin.';
            case 'Raporlar': return 'Finansal raporları ve istatistikleri görüntüleyin.';
            case 'Ayarlar': return 'Hesap ve sistem tercihlerinizi yapılandırın.';
            default: return 'Detayları görüntüleyin ve yönetin.';
        }
    };

    const formatTime = (isoString) => {
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        } catch (_) {
            return '';
        }
    };

    const popoverStyle = {
        position: 'absolute',
        top: '55px',
        right: '0px',
        width: '340px',
        maxHeight: '400px',
        background: 'var(--glass-bg, rgba(255, 255, 255, 0.15))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--border-color, rgba(255, 255, 255, 0.2))',
        borderRadius: '14px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        textAlign: 'left'
    };

    return (
        <header className="topbar">
            <div className="topbar-left">
                <button className="menu-toggle-btn" onClick={onMenuClick}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
                <div className="page-title">
                    <h1>{activeMenu}</h1>
                    <p>{getSubtitle()}</p>
                </div>
            </div>

            <div className="topbar-actions">
                <button className="action-btn" onClick={toggleTheme} title="Tema Değiştir">
                    {theme === 'light' ? '☀️' : '🌙'}
                </button>
                
                <div style={{ position: 'relative', display: 'inline-block' }} ref={popoverRef}>
                    <button 
                        className={`action-btn ${isOpen ? 'active' : ''}`} 
                        onClick={() => setIsOpen(!isOpen)}
                        title="Bildirimler"
                        style={{ position: 'relative' }}
                    >
                        🔔
                        {unreadCount > 0 && (
                            <span 
                                className="badge"
                                style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    right: '-4px',
                                    background: '#ef4444',
                                    color: '#ffffff',
                                    borderRadius: '50%',
                                    padding: '1px 5px',
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)'
                                }}
                            >
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {isOpen && (
                        <div style={popoverStyle}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px 14px',
                                borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
                                background: 'rgba(0, 0, 0, 0.03)'
                            }}>
                                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '13px' }}>Bildirimler</span>
                                {unreadCount > 0 && (
                                    <button 
                                        onClick={handleMarkAllRead}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#10b981',
                                            fontSize: '11px',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            padding: '4px 8px',
                                            borderRadius: '6px'
                                        }}
                                    >
                                        Tümünü Okundu Yap
                                    </button>
                                )}
                            </div>

                            <div style={{
                                overflowY: 'auto',
                                flex: 1,
                                maxHeight: '330px'
                            }}>
                                {notifications.length === 0 ? (
                                    <div style={{
                                        padding: '24px 16px',
                                        textAlign: 'center',
                                        color: 'var(--text-secondary, #94a3b8)',
                                        fontSize: '13px'
                                    }}>
                                        <div style={{ fontSize: '20px' }}>🎉</div>
                                        <div style={{ marginTop: '6px' }}>Hiç bildiriminiz bulunmuyor.</div>
                                    </div>
                                ) : (
                                    notifications.map(n => (
                                        <div 
                                            key={n.id}
                                            onClick={() => handleNotificationClick(n.id)}
                                            style={{
                                                padding: '12px 14px 12px 20px',
                                                borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.05))',
                                                cursor: 'pointer',
                                                background: n.read ? 'transparent' : 'rgba(16, 185, 129, 0.05)',
                                                transition: 'background 0.2s',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '4px',
                                                position: 'relative'
                                            }}
                                        >
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <span style={{ 
                                                    fontWeight: n.read ? '500' : 'bold', 
                                                    color: 'var(--text-primary)',
                                                    fontSize: '12.5px'
                                                }}>
                                                    {n.title}
                                                </span>
                                                <span style={{ 
                                                    fontSize: '10px', 
                                                    color: 'var(--text-secondary, #94a3b8)' 
                                                }}>
                                                    {formatTime(n.createdAt)}
                                                </span>
                                            </div>
                                            <p style={{ 
                                                margin: 0, 
                                                fontSize: '11.5px', 
                                                color: 'var(--text-secondary, #94a3b8)',
                                                lineHeight: '1.45'
                                            }}>
                                                {n.message}
                                            </p>
                                            {!n.read && (
                                                <span style={{
                                                    position: 'absolute',
                                                    left: '7px',
                                                    top: '16px',
                                                    width: '6px',
                                                    height: '6px',
                                                    background: '#10b981',
                                                    borderRadius: '50%',
                                                    boxShadow: '0 0 6px #10b981'
                                                }}></span>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <button
                    className="action-btn logout-action-btn"
                    onClick={onLogout}
                    title="Çıkış Yap"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                </button>
                {activeMenu === 'Faturalar' && (
                    <button className="primary-btn" onClick={onAddInvoice}>+ Yeni Fatura</button>
                )}
                {activeMenu === 'Personel Yönetimi' && (
                    <button className="primary-btn" onClick={onAddStaff}>+ Personel Ekle</button>
                )}
                {activeMenu === 'Raporlar' && (
                    <button className="primary-btn" onClick={onDownloadReport}>Rapor İndir</button>
                )}
            </div>
        </header>
    );
};

export default Topbar;
