import React, { useRef, useEffect } from 'react';
import styles from './Modal.module.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  maxWidth = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  children,
  className = ''
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Auto-scroll to modal when it opens
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    // Handle ESC key to close modal
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm': return styles['modal--sm'];
      case 'md': return styles['modal--md'];
      case 'lg': return styles['modal--lg'];
      case 'xl': return styles['modal--xl'];
      case '2xl': return styles['modal--2xl'];
      default: return styles['modal--md'];
    }
  };

  return (
    <div 
      className={styles.backdrop}
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className={`${styles.modal} ${getMaxWidthClass()} ${className}`}
      >
        {/* Header */}
        {(title || subtitle || showCloseButton) && (
          <div className={styles.header}>
            <div className={styles.headerContent}>
              {title && <h3 className={styles.title}>{title}</h3>}
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className={styles.closeButton}
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;