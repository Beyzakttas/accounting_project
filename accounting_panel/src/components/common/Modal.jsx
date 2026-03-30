import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

/**
 * Reusable Premium Modal Component
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Function to call when modal overlay or cancel button is clicked
 * @param {string} title - The header title of the modal
 * @param {ReactNode} children - The body content of the modal (inputs, text, etc)
 * @param {function} onSubmit - Optional. If provided, renders a form. If not, renders basic divs.
 * @param {string} submitText - Text for the primary action button
 * @param {string} submitClassName - Custom CSS class for the primary action button
 * @param {string} maxWidth - Maximum width of the modal
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  onSubmit,
  submitText = 'Kaydet',
  submitClassName = 'primary-btn',
  maxWidth = '800px'
}) => {

  // Client-side hydration preventer for portals
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      {/* e.stopPropagation() prevents the modal from closing when clicking inside it */}
      <div 
        className="invoice-modal glass-card modal-content" 
        style={{ maxWidth, width: '90%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>
        </div>
        
        {onSubmit ? (
          <form onSubmit={onSubmit}>
            {children}
            <div className="modal-actions mt-4">
              <button type="button" className="cancel-btn" onClick={onClose}>İptal</button>
              <button type="submit" className={submitClassName}>{submitText}</button>
            </div>
          </form>
        ) : (
          <>
            {children}
            <div className="modal-actions mt-4">
              <button type="button" className="cancel-btn" onClick={onClose}>Kapat</button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
