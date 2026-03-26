import React from 'react';

const LoadingButton = ({ 
    isLoading, 
    children, 
    className = "login-btn", 
    type = "submit", 
    disabled = false,
    ...props 
}) => {
    return (
        <button 
            type={type} 
            className={className} 
            disabled={isLoading || disabled} 
            {...props}
        >
            {isLoading ? <span className="loader"></span> : children}
        </button>
    );
};

export default LoadingButton;
