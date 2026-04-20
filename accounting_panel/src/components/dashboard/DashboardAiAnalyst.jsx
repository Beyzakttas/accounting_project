import React from 'react';

const DashboardAiAnalyst = ({ isAnalyzing, handleFileUpload }) => {
  return (
    <div className="recent-activity glass-card">
      <div className="card-header">
        <h2>Yapay Zeka Fatura Analizi</h2>
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
            <div className="analyzing-text">ANALİZ EDİLİYOR...</div>
          </div>
        ) : (
          <>
            <div className="upload-icon">☁️</div>
            <p className="upload-text">Faturanızı sürükleyin veya <span className="highlight">dosya seçin</span></p>
            <p className="upload-sub">PDF, JPG, PNG (Max. 10MB)</p>
            <button
              className="upload-btn"
              onClick={() => document.getElementById('ai-file-input').click()}
            >
              Bilgisayardan Seç
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardAiAnalyst;
