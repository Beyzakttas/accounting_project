import React from 'react';
import Modal from './Modal';

/**
 * Premium Confirmation Modal
 * Reuses the base Modal component but specialized for confirmation actions.
 */
const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Emin misiniz?', 
  message, 
  confirmText = 'Evet, Devam Et', 
  cancelText = 'Vazgeç',
  type = 'warning' // 'warning', 'danger', 'info'
}) => {
  
  const getButtonClass = () => {
    switch (type) {
      case 'danger': return 'danger-btn';
      case 'warning': return 'primary-btn';
      default: return 'primary-btn';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="450px"
      closeOnOverlayClick={false}
    >
      <div className="confirm-modal-content">
        <p className="confirm-message">{message}</p>
        
        <div className="modal-actions mt-4" style={{ borderTop: 'none', marginTop: '1rem', paddingTop: 0 }}>
          <button 
            type="button" 
            className="cancel-btn" 
            onClick={onClose}
            style={{ flex: 1 }}
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            className={getButtonClass()} 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{ flex: 1.5 }}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style jsx>{`
        .confirm-modal-content {
          text-align: center;
          padding: 1rem 0.5rem;
        }
        .confirm-message {
          font-size: 1.1rem;
          color: var(--text-primary);
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }
        .modal-actions {
          display: flex;
          gap: 1rem;
        }
      `}</style>
    </Modal>
  );
};

export default ConfirmModal;
