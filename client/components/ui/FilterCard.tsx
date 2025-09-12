import React from 'react';
import styles from './FilterCard.module.css';

export interface FilterOption {
  id: string;
  label: string;
  value: number;
  color: 'blue' | 'yellow' | 'green' | 'red' | 'purple' | 'orange';
  activeText?: string;
  inactiveText?: string;
}

interface FilterCardProps {
  options: FilterOption[];
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
  className?: string;
}

export const FilterCard: React.FC<FilterCardProps> = ({
  options,
  activeFilter,
  onFilterChange,
  className = ''
}) => {
  return (
    <div className={`${styles.filterGrid} ${className}`}>
      {options.map((option) => {
        const isActive = activeFilter === option.id;
        
        return (
          <button
            key={option.id}
            onClick={() => onFilterChange(option.id)}
            className={`${styles.filterButton} ${styles[`filterButton--${option.color}`]} ${
              isActive ? styles.filterButtonActive : styles.filterButtonInactive
            }`}
          >
            <div className={styles.filterValue}>
              {option.value}
            </div>
            <div className={styles.filterLabel}>
              {option.label}
            </div>
            <div className={styles.filterIndicator}>
              {isActive 
                ? (option.activeText || '← Filtro activo')
                : (option.inactiveText || 'Clic para filtrar')
              }
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default FilterCard;