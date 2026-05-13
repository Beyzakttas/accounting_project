import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const DashboardAiAnalyst = ({ isAnalyzing, handleFileUpload, aiProgressMessage }) => {
  const { language } = useLanguage();

  return (
    <div className="recent-activity glass-card">
      <div className="card-header">
        <h2>{language === 'tr' ? 'Yapay Zeka Fatura Analizi' : 'AI Invoice Analysis'}</h2>
      </div>
      <div className={`ai-upload-area ${isAnalyzing ? 'analyzing' : ''}`}>
        <input
          type="file"
          id="ai-file-input"
          hidden
          accept="image/*,application/pdf"
          onChange={handleFileUpload}
          disabled={isAnalyzing}
        />
        
        {isAnalyzing ? (
          <div className="scanner-container">
            <div className="scan-ring"></div>
            <div className="analyzing-text">{aiProgressMessage || (language === 'tr' ? 'ANALİZ EDİLİYOR...' : 'ANALYZING...')}</div>
          </div>
        ) : (
          <>
            <div className="upload-icon">☁️</div>
            <p className="upload-text">
              {language === 'tr' ? (
                <>Faturanızı sürükleyin veya <span className="highlight">dosya seçin</span></>
              ) : (
                <>Drag your invoice here or <span className="highlight">choose a file</span></>
              )}
            </p>
            <p className="upload-sub">PDF, JPG, PNG (Max. 10MB)</p>
            <button
              className="upload-btn"
              onClick={() => document.getElementById('ai-file-input').click()}
            >
              {language === 'tr' ? 'Bilgisayardan Seç' : 'Choose from Computer'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardAiAnalyst;
