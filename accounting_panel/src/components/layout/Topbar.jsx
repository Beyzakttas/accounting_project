import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useLanguage } from '../../contexts/LanguageContext';

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
    const navigate = useNavigate();
    const { language, toggleLanguage, t } = useLanguage();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef(null);
    
    // Ses Kapatma/Açma State ve Metodu
    const [isMuted, setIsMuted] = useState(() => {
        return localStorage.getItem('in_app_notifications_sound_muted') === 'true';
    });

    const toggleMute = (e) => {
        e.stopPropagation();
        const nextMuted = !isMuted;
        setIsMuted(nextMuted);
        localStorage.setItem('in_app_notifications_sound_muted', String(nextMuted));
    };

    // Fatura Detay Modalı State'leri
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [loadingInvoice, setLoadingInvoice] = useState(false);

    const loadNotifications = async () => {
        const list = JSON.parse(localStorage.getItem('in_app_notifications') || '[]');
        setNotifications(list);

        try {
            const response = await apiClient.get('/invoice');
            if (response && response.success) {
                const liveInvoiceIds = new Set(response.data.map(inv => inv._id));
                const cleanedList = list.filter(n => !n.id || liveInvoiceIds.has(n.id));
                
                if (cleanedList.length !== list.length) {
                    localStorage.setItem('in_app_notifications', JSON.stringify(cleanedList));
                    setNotifications(cleanedList);
                }
            }
        } catch (err) {
            console.error('Bildirimler temizlenirken hata oluştu:', err);
        }
    };

    useEffect(() => {
        loadNotifications();

        const handleUpdate = () => {
            loadNotifications();
        };

        window.addEventListener('newNotification', handleUpdate);
        window.addEventListener('invoiceUpdated', handleUpdate);
        
        return () => {
            window.removeEventListener('newNotification', handleUpdate);
            window.removeEventListener('invoiceUpdated', handleUpdate);
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

    const handleNotificationClick = async (id) => {
        const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
        setNotifications(updated);
        localStorage.setItem('in_app_notifications', JSON.stringify(updated));
        
        setIsOpen(false);
        setIsDetailModalOpen(true);
        setLoadingInvoice(true);
        setSelectedInvoice(null);

        try {
            const response = await apiClient.get('/invoice');
            if (response && response.success) {
                const found = response.data.find(inv => inv._id === id);
                if (found) {
                    setSelectedInvoice(found);
                } else {
                    setIsDetailModalOpen(false);
                    handleDeleteNotification(id);
                    alert(t('topbar.deletedInvoiceAlert'));
                }
            }
        } catch (err) {
            console.error('Fatura detayları çekilemedi:', err);
            setIsDetailModalOpen(false);
            alert(language === 'tr' ? "Fatura detayları yüklenirken bir hata oluştu." : "An error occurred while loading invoice details.");
        } finally {
            setLoadingInvoice(false);
        }
    };

    const handlePayInvoiceFromModal = async (invoiceId) => {
        try {
            const response = await apiClient.put(`/invoice/${invoiceId}/pay`);
            if (response.success) {
                setSelectedInvoice(prev => ({ ...prev, status: 'Processed' }));
                window.dispatchEvent(new CustomEvent('invoiceUpdated'));
            }
        } catch (err) {
            console.error('Ödeme işlemi başarısız:', err);
        }
    };

    const handleMarkSingleRead = (id) => {
        const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
        setNotifications(updated);
        localStorage.setItem('in_app_notifications', JSON.stringify(updated));
    };

    const handleDeleteNotification = (id) => {
        const updated = notifications.filter(n => n.id !== id);
        setNotifications(updated);
        localStorage.setItem('in_app_notifications', JSON.stringify(updated));
    };

    const handleClearAllNotifications = () => {
        setNotifications([]);
        localStorage.setItem('in_app_notifications', JSON.stringify([]));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const getTranslatedMenuTitle = (menu) => {
        switch (menu) {
            case 'Anasayfa': return t('sidebar.dashboard');
            case 'Faturalar': return t('sidebar.invoices');
            case 'Personel Yönetimi': return t('sidebar.staff');
            case 'Raporlar': return t('sidebar.reports');
            case 'Ayarlar': return t('sidebar.settings');
            default: return menu;
        }
    };

    const getSubtitle = () => {
        switch (activeMenu) {
            case 'Anasayfa': return language === 'tr' ? 'Sistemin genel durumu ve özet bilgiler.' : 'General system status and summary information.';
            case 'Personel Yönetimi': return language === 'tr' ? 'Şirket çalışanlarını görüntüleyin ve yönetin.' : 'View and manage company staff.';
            case 'Faturalar': return language === 'tr' ? 'Sisteme yüklenen faturaları inceleyin ve yönetin.' : 'Review and manage uploaded invoices.';
            case 'Raporlar': return language === 'tr' ? 'Finansal raporları ve istatistikleri görüntüleyin.' : 'View financial reports and statistics.';
            case 'Ayarlar': return language === 'tr' ? 'Hesap ve sistem tercihlerinizi yapılandırın.' : 'Configure account and system preferences.';
            default: return language === 'tr' ? 'Detayları görüntüleyin ve yönetin.' : 'View and manage details.';
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
                    <h1>{getTranslatedMenuTitle(activeMenu)}</h1>
                    <p>{getSubtitle()}</p>
                </div>
            </div>

            <div className="topbar-actions">
                <button 
                    className="action-btn" 
                    onClick={toggleLanguage} 
                    title={language === 'tr' ? "Switch to English" : "Türkçe'ye Geç"}
                    style={{ fontWeight: '700', fontSize: '11px', letterSpacing: '0.5px' }}
                >
                    {language === 'tr' ? '🇹🇷 TR' : '🇬🇧 EN'}
                </button>

                <button className="action-btn" onClick={toggleTheme} title={language === 'tr' ? "Tema Değiştir" : "Change Theme"}>
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
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '13px' }}>{t('topbar.notifications')}</span>
                                    <button
                                        onClick={toggleMute}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '2px',
                                            fontSize: '12px',
                                            lineHeight: '1',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '50%',
                                            transition: 'all 0.2s',
                                            width: '20px',
                                            height: '20px',
                                            opacity: 0.75
                                        }}
                                        title={isMuted ? t('topbar.unmute') : t('topbar.mute')}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                                            e.target.style.opacity = 1;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = 'none';
                                            e.target.style.opacity = 0.75;
                                        }}
                                    >
                                        {isMuted ? '🔇' : '🔊'}
                                    </button>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
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
                                                padding: '4px 6px',
                                                borderRadius: '6px',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.background = 'rgba(16, 185, 129, 0.1)'}
                                            onMouseLeave={(e) => e.target.style.background = 'none'}
                                        >
                                            {t('topbar.markAllRead')}
                                        </button>
                                    )}
                                    {notifications.length > 0 && (
                                        <button 
                                            onClick={handleClearAllNotifications}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#ef4444',
                                                fontSize: '11px',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                padding: '4px 6px',
                                                borderRadius: '6px',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                                            onMouseLeave={(e) => e.target.style.background = 'none'}
                                        >
                                            {t('topbar.clearAll')}
                                        </button>
                                    )}
                                </div>
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
                                        <div style={{ marginTop: '6px' }}>{language === 'tr' ? 'Hiç bildiriminiz bulunmuyor.' : 'You have no notifications.'}</div>
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
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ 
                                                        fontSize: '10px', 
                                                        color: 'var(--text-secondary, #94a3b8)' 
                                                    }}>
                                                        {formatTime(n.createdAt)}
                                                    </span>
                                                    {!n.read && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleMarkSingleRead(n.id);
                                                            }}
                                                            style={{
                                                                background: 'rgba(16, 185, 129, 0.15)',
                                                                border: 'none',
                                                                color: '#10b981',
                                                                borderRadius: '4px',
                                                                padding: '2px 6px',
                                                                fontSize: '9.5px',
                                                                cursor: 'pointer',
                                                                fontWeight: 'bold',
                                                                transition: 'all 0.2s',
                                                                lineHeight: '1.2'
                                                            }}
                                                            title={language === 'tr' ? "Okundu Olarak İşaretle" : "Mark as Read"}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.background = '#10b981';
                                                                e.target.style.color = '#fff';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.background = 'rgba(16, 185, 129, 0.15)';
                                                                e.target.style.color = '#10b981';
                                                            }}
                                                        >
                                                            {t('topbar.read')}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteNotification(n.id);
                                                        }}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: 'var(--text-secondary, #94a3b8)',
                                                            fontSize: '11px',
                                                            cursor: 'pointer',
                                                            padding: '4px',
                                                            lineHeight: '1',
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            transition: 'all 0.2s',
                                                            width: '18px',
                                                            height: '18px'
                                                        }}
                                                        title={language === 'tr' ? "Bildirimi Sil" : "Delete Notification"}
                                                        onMouseEnter={(e) => {
                                                            e.target.style.background = 'rgba(239, 68, 68, 0.15)';
                                                            e.target.style.color = '#ef4444';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.target.style.background = 'none';
                                                            e.target.style.color = 'var(--text-secondary, #94a3b8)';
                                                        }}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                            <p style={{ 
                                                margin: 0, 
                                                fontSize: '11.5px', 
                                                color: 'var(--text-secondary, #94a3b8)',
                                                lineHeight: '1.45',
                                                paddingRight: '12px'
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

            {/* Custom Modal Animations Stylesheet */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleUp {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>

            {/* Fatura Detay Modalı */}
            {isDetailModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(12px)',
                    zIndex: 99999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'fadeIn 0.25s ease-out'
                }} onClick={() => setIsDetailModalOpen(false)}>
                    <div style={{
                        background: 'var(--modal-bg, rgba(30, 41, 59, 0.85))',
                        border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.08))',
                        borderRadius: '24px',
                        width: '90%',
                        maxWidth: '520px',
                        padding: '28px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        color: 'var(--text-primary)',
                        position: 'relative',
                        animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }} onClick={(e) => e.stopPropagation()}>
                        
                        {/* Kapatma Butonu */}
                        <button 
                            onClick={() => setIsDetailModalOpen(false)}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                                fontSize: '14px',
                                fontWeight: 'bold'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.15)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
                        >
                            ✕
                        </button>

                        {loadingInvoice ? (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '40px 0',
                                gap: '12px'
                            }}>
                                <div style={{
                                    border: '3px solid rgba(255, 255, 255, 0.1)',
                                    borderTop: '3px solid #10b981',
                                    borderRadius: '50%',
                                    width: '36px',
                                    height: '36px',
                                    animation: 'spin 1s linear infinite'
                                }} />
                                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{t('common.loading')}</span>
                            </div>
                        ) : selectedInvoice ? (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                    <span style={{ fontSize: '28px' }}>📄</span>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>{t('topbar.invoiceDetails')}</h3>
                                        <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                                            {selectedInvoice.invoiceNumber}
                                        </p>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '14px',
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    padding: '20px',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255, 255, 255, 0.04)',
                                    marginBottom: '24px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                                        <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>{t('topbar.amount')}</span>
                                        <span style={{ fontSize: '16px', fontWeight: '700', color: '#10b981' }}>
                                            {apiClient.formatCurrency(selectedInvoice.amount)}
                                        </span>
                                    </div>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                                        <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>{t('topbar.vendor')}</span>
                                        <span style={{ fontSize: '13.5px', fontWeight: '600' }}>{selectedInvoice.vendor || (language === 'tr' ? 'Genel' : 'General')}</span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                                        <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>{t('topbar.category')}</span>
                                        <span style={{ fontSize: '13.5px', fontWeight: '600' }}>{selectedInvoice.category?.name || (language === 'tr' ? 'Fatura' : 'Invoice')}</span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                                        <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>{t('topbar.department')}</span>
                                        <span style={{ fontSize: '13.5px', fontWeight: '600' }}>
                                            {selectedInvoice.department ? (language === 'tr' ? selectedInvoice.department : (selectedInvoice.department === 'Muhasebe' ? 'Accounting' : selectedInvoice.department === 'Finans' ? 'Finance' : selectedInvoice.department === 'IK' ? 'HR' : selectedInvoice.department === 'Satis' ? 'Sales' : selectedInvoice.department === 'Pazarlama' ? 'Marketing' : selectedInvoice.department === 'Yazilim' ? 'Software' : selectedInvoice.department === 'Operasyon' ? 'Operations' : 'Other')) : t('common.other')}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                                        <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>{t('topbar.uploadedBy')}</span>
                                        <span style={{ fontSize: '13.5px', fontWeight: '600' }}>
                                            {selectedInvoice.uploadedBy?.fullname || selectedInvoice.uploadedBy?.name || (language === 'tr' ? 'Sistem' : 'System')}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                                        <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>{t('topbar.date')}</span>
                                        <span style={{ fontSize: '13.5px', fontWeight: '600' }}>{apiClient.formatDate(selectedInvoice.date)}</span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                                        <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>{t('topbar.description')}</span>
                                        <span style={{ fontSize: '13.5px', fontWeight: '500', color: 'var(--text-secondary)', textAlign: 'right', maxWidth: '60%' }}>
                                            {selectedInvoice.description || '-'}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                                        <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>{t('topbar.status')}</span>
                                        <span style={{
                                            fontSize: '12.5px',
                                            fontWeight: '700',
                                            padding: '4px 10px',
                                            borderRadius: '8px',
                                            background: selectedInvoice.status === 'Pending' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                                            color: selectedInvoice.status === 'Pending' ? '#f59e0b' : '#22c55e'
                                        }}>
                                            {selectedInvoice.status === 'Pending' ? t('topbar.pending') : t('topbar.paid')}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    {selectedInvoice.status === 'Pending' && (
                                        <button
                                            onClick={() => handlePayInvoiceFromModal(selectedInvoice._id)}
                                            style={{
                                                background: 'var(--primary-gradient, linear-gradient(135deg, #10b981, #059669))',
                                                color: '#fff',
                                                border: 'none',
                                                padding: '10px 20px',
                                                borderRadius: '12px',
                                                fontSize: '13.5px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'transform 0.2s',
                                            }}
                                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                        >
                                            {t('topbar.payInvoice')}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsDetailModalOpen(false)}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.08)',
                                            color: 'var(--text-primary)',
                                            border: '1px solid rgba(255, 255, 255, 0.05)',
                                            padding: '10px 20px',
                                            borderRadius: '12px',
                                            fontSize: '13.5px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.12)'}
                                        onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.08)'}
                                    >
                                        {t('common.close')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)' }}>
                                {language === 'tr' ? 'Fatura detayları yüklenemedi.' : 'Failed to load invoice details.'}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Topbar;
