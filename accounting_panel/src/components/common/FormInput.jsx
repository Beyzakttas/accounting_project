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
  options = [],
  className = '',
  required,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  // Formik useField integration (with fallback for manual use)
  let field = {}, meta = {};
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    [field, meta] = useField(props);
  } catch (e) {
    field = { name: props.name, value: props.value || '', onChange: props.onChange, onBlur: props.onBlur };
    meta = { error: props.error, touched: !!props.error };
  }

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const fieldError = meta.touched && meta.error ? meta.error : (props.error || '');

  const commonProps = {
    ...field,
    ...props,
    className: `glass-input form-group-input ${isPassword ? 'has-icon' : ''} ${fieldError ? 'input-error' : ''}`
  };

  return (
    <div className={`form-group-wrapper ${className}`}>
      {label && (
        <label className="form-group-label">
          {label} {required && <span className="required-asterisk">*</span>}
        </label>
      )}

      <div className="input-wrapper">
        {type === 'select' ? (
          <select {...commonProps}>
            <option value="" disabled>Seçiniz</option>
            {options.map((opt, idx) => (
              <option key={idx} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : (
          <input {...commonProps} type={inputType} />
        )}

        {isPassword && (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1"
          >
            {showPassword ? <EyeIcon /> : <EyeOffIcon />}
          </button>
        )}
      </div>

      {fieldError && <span className="error-text">{fieldError}</span>}
    </div>
  );
};

// Internal mini icons to keep it cleaner
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);
const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
);


export default FormInput;
