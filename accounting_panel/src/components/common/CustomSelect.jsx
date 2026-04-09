import React, { useState, useRef, useEffect } from 'react';
import './CustomSelect.css';

const CustomSelect = ({ options, value, onChange, placeholder = "Seçiniz...", label, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="custom-select-wrapper" ref={dropdownRef}>
      {label && <label className="form-label">{label}</label>}
      
      <div 
        className={`custom-select-trigger ${isOpen ? 'active' : ''} ${error ? 'error' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <span className={`arrow-icon ${isOpen ? 'up' : 'down'}`}>▼</span>
      </div>

      {isOpen && (
        <div className="custom-select-options-container">
          <div className="custom-select-options-list">
            {options.map((option) => (
              <div 
                key={option.value}
                className={`custom-select-option ${value === option.value ? 'selected' : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </div>
            ))}
            {options.length === 0 && <div className="no-options">Kategori bulunamadı</div>}
          </div>
        </div>
      )}
      
      {error && <div className="error-text">{error}</div>}
    </div>
  );
};

export default CustomSelect;
