import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import '../../assets/css/AuthLayout.css';

const AuthLayout = ({ 
    children, 
    title, 
    subtitle, 
    containerClass = "login-glass-card",
    wrapperClass = "login-wrapper",
    showThemeToggle = true,
    ...props
}) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className={wrapperClass} {...props}>
            {showThemeToggle && (
                <button type="button" className="theme-toggle" onClick={toggleTheme} style={{ zIndex: 100 }}>
                    {theme === 'light' ? '☀️' : '🌙'}
                </button>
            )}

            <div className="blobs">
                <div className="blob blob-1" />
                <div className="blob blob-2" />
            </div>

            <div className={containerClass}>
                {(title || subtitle) && (
                    <div className="login-header">
                        {title && <h1 className="login-title">{title}</h1>}
                        {subtitle && <p className="login-subtitle">{subtitle}</p>}
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;
