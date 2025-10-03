import React from 'react';
import { Cooperative } from '@/types';
import styles from './CooperativeNameCell.module.css';

interface CooperativeNameCellProps {
  cooperative: Cooperative;
}

export const CooperativeNameCell: React.FC<CooperativeNameCellProps> = ({
  cooperative
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.name}>{cooperative.name}</div>
      <div className={styles.email}>{cooperative.email}</div>
    </div>
  );
};

export default CooperativeNameCell;