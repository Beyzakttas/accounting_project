import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import '../../assets/css/AuthLayout.css';

const AuthLayout = ({
    children,
    leftPanelContent,
    showThemeToggle = true,
    ...props
}) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="auth-split-wrapper" {...props}>
            {showThemeToggle && (
                <button type="button" className="theme-toggle" onClick={toggleTheme} title="Tema Değiştir">
                    {theme === 'light' ? '☀️' : '🌙'}
                </button>
            )}

            {/* Left Panel - Information / Branding */}
            <div className="auth-left-panel">
                <div className="auth-left-content">
                    {leftPanelContent}
                </div>
                {/* Background decorative elements for the left panel */}
                <div className="auth-left-decoration circle-1"></div>
                <div className="auth-left-decoration circle-2"></div>
            </div>

            {/* Right Panel - Form Area */}
            <div className="auth-right-panel">
                <div className="auth-form-container">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
