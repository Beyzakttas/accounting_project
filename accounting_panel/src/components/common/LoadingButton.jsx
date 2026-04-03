import React from 'react';

const LoadingButton = ({ 
    isLoading, 
    children, 
    className = "login-btn", 
    type = "submit", 
    disabled = false, 
    ...props 
}) => (
    <button 
        {...props} 
        type={type} 
        className={className} 
        disabled={isLoading || disabled}
    >
        {isLoading ? <span className="loader"></span> : children}
    </button>
);

export default LoadingButton;

