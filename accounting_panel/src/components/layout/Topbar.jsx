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
    onAddInvoice
}) => {
    return (
        <header className="topbar">
            <div className="page-title">
                <h1>{activeMenu}</h1>
                <p>Sistemin genel durumu ve özet bilgiler.</p>
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
            </div>
        </header>
    );
};

export default Topbar;
