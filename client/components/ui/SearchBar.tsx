import { ChangeEvent } from 'react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helpText?: string;
  icon?: string;
  className?: string;
  disabled?: boolean;
  compact?: boolean; // New prop for inline usage
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Buscar...",
  helpText,
  icon = "🔍",
  className = "",
  disabled = false,
  compact = false
}: SearchBarProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    onChange('');
  };

  // Compact version for inline usage
  if (compact) {
    return (
      <div className={`${styles.compactWrapper} ${className}`}>
        <div className={styles.compactInputWrapper}>
          <span className={styles.compactIcon}>{icon}</span>
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className={styles.compactInput}
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className={styles.compactClearButton}
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    );
  }

  // Original full version
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.searchGroup}>
        <h3 className={styles.title}>
          {icon} Buscar
        </h3>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className={styles.input}
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className={styles.clearButton}
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>
        {helpText && (
          <div className={styles.helpText}>
            💡 {helpText}
          </div>
        )}
      </div>
    </div>
  );
}