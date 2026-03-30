import React from 'react';

const Topbar = ({
    activeMenu,
    user,
    companies,
    selectedCompanyId,
    setSelectedCompanyId,
    theme,
    toggleTheme,
    onLogout,
    onAddInvoice,
    onAddStaff,
    onDownloadReport
}) => {
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

    return (
        <header className="topbar">
            <div className="page-title">
                <h1>{activeMenu}</h1>
                <p>{getSubtitle()}</p>
            </div>

            <div className="topbar-actions">
                <button className="action-btn" onClick={toggleTheme} title="Tema Değiştir">
                    {theme === 'light' ? '☀️' : '🌙'}
                </button>
                <button className="action-btn">🔔<span className="badge">3</span></button>
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
