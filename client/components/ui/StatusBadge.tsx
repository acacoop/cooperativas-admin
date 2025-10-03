import React from 'react';
import styles from './StatusBadge.module.css';

export type StatusVariant = 'active' | 'inactive' | 'pending' | 'success' | 'warning' | 'error';

interface StatusBadgeProps {
  variant: StatusVariant;
  children: React.ReactNode;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant,
  children,
  className = ''
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'active':
      case 'success':
        return styles.success;
      case 'inactive':
        return styles.inactive;
      case 'pending':
      case 'warning':
        return styles.warning;
      case 'error':
        return styles.error;
      default:
        return styles.inactive;
    }
  };

  return (
    <span className={`${styles.badge} ${getVariantClass()} ${className}`}>
      {children}
    </span>
  );
};

export default StatusBadge;