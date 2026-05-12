import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'tr';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'tr' : 'en'));
  };

  const t = (path) => {
    const keys = path.split('.');
    let value = translations[language];
    for (const key of keys) {
      if (!value || value[key] === undefined) {
        // Fallback to Turkish if translation is missing, or return the path
        let trValue = translations['tr'];
        for (const trKey of keys) {
          if (!trValue) break;
          trValue = trValue[trKey];
        }
        return trValue || path;
      }
      value = value[key];
    }
    return value;
  };

  const getDepartmentOptions = () => [
    { value: 'Muhasebe', label: t('departments.Muhasebe') },
    { value: 'Finans', label: t('departments.Finans') },
    { value: 'IK', label: t('departments.IK') },
    { value: 'Satis', label: t('departments.Satis') },
    { value: 'Pazarlama', label: t('departments.Pazarlama') },
    { value: 'Yazilim', label: t('departments.Yazilim') },
    { value: 'Operasyon', label: t('departments.Operasyon') },
    { value: 'Diger', label: t('departments.Diger') }
  ];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, getDepartmentOptions }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
