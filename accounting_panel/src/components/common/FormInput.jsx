import React, { useState } from 'react';
import { useField } from 'formik';

/**
 * Reusable Form Input Component
 * Handles standard inputs, passwords with toggle, and select dropdowns.
 * Now uses Formik's useField hook for seamless integration while maintaining
 * backward compatibility for manual use.
 */
const FormInput = ({
  label,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  options = [], // for type="select" [{value: '1', label: 'One'}]
  className = '',
  // These props remain for manual (non-formik) usage
  value: manualValue,
  onChange: manualOnChange,
  onBlur: manualOnBlur,
  error: manualError,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  // Formik integration using useField
  // If used outside Formik context, useField will throw an error.
  // We use a try-catch to support hybrid (manual) usage.
  let field, meta;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    [field, meta] = useField(props);
  } catch (e) {
    // Fallback for manual usage
    field = { 
      name: props.name, 
      value: manualValue || '', 
      onChange: manualOnChange, 
      onBlur: manualOnBlur 
    };
    meta = { 
      error: manualError, 
      touched: !!manualError 
    };
  }

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  
  // Decide which error to show
  const fieldError = meta.touched && meta.error ? meta.error : (manualError || '');

  return (
    <div className={`form-group-wrapper ${className}`}>
      {label && (
        <label className="form-group-label">
          {label} {required && <span className="required-asterisk">*</span>}
        </label>
      )}

      <div className="input-wrapper">
        {type === 'select' ? (
          <select
            {...field}
            {...props}
            disabled={disabled}
            className={`glass-input form-group-input ${fieldError ? 'input-error' : ''}`}
          >
            <option value="" disabled>Seçiniz</option>
            {options.map((opt, idx) => (
              <option key={idx} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : (
          <input
            {...field}
            {...props}
            type={inputType}
            placeholder={placeholder}
            disabled={disabled}
            className={`glass-input form-group-input ${isPassword ? 'has-icon' : ''} ${fieldError ? 'input-error' : ''}`}
          />
        )}

        {isPassword && (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1"
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
            )}
          </button>
        )}
      </div>

      {fieldError && (
        <span className="error-text">
          {fieldError}
        </span>
      )}
    </div>
  );
};

export default FormInput;
