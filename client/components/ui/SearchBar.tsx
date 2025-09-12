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
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Buscar...",
  helpText,
  icon = "🔍",
  className = "",
  disabled = false
}: SearchBarProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    onChange('');
  };

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