import React from 'react';
import styles from './FilterSelector.module.css';

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
  id?: string;
}

export const FilterSelector: React.FC<FilterSelectorProps> = ({
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  className = "",
  disabled = false,
  label,
  id
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`${styles.filterContainer} ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className={styles.filterLabel}
        >
          {label}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={`${styles.filterSelect} ${disabled ? styles['filterSelect--disabled'] : ''}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterSelector;