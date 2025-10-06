import React from 'react';
import styles from './CardViewToggle.module.css';

export type ViewMode = 'cards' | 'table';

export interface ViewOption {
  id: ViewMode;
  label: string;
  icon: string;
}

interface CardViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
  options?: ViewOption[];
}

const defaultOptions: ViewOption[] = [
  { id: 'cards', label: 'Tarjetas', icon: '🗂️' },
  { id: 'table', label: 'Tabla', icon: '📊' }
];

export const CardViewToggle: React.FC<CardViewToggleProps> = ({
  viewMode,
  onViewModeChange,
  className = '',
  options = defaultOptions
}) => {
  return (
    <div className={`${styles.toggleContainer} ${className}`}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onViewModeChange(option.id)}
          className={`${styles.toggleButton} ${
            viewMode === option.id ? styles.toggleButtonActive : styles.toggleButtonInactive
          }`}
        >
          <span className={styles.toggleIcon}>{option.icon}</span>
          <span className={styles.toggleLabel}>{option.label}</span>
        </button>
      ))}
    </div>
  );
};

export default CardViewToggle;