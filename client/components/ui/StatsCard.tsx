import React from 'react';
import styles from './StatsCard.module.css';

export interface StatItem {
  id: string;
  value: string | number;
  label: string;
  description: string;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow';
  icon?: string;
}

interface StatsCardProps {
  stat: StatItem;
}

export const StatsCard: React.FC<StatsCardProps> = ({ stat }) => {
  return (
    <div className={`${styles.statCard} ${styles[`statCard--${stat.color}`]}`}>
      <div className={styles.statValue}>
        {stat.icon && <span className={styles.statIcon}>{stat.icon}</span>}
        {stat.value}
      </div>
      <div className={styles.statLabel}>{stat.label}</div>
      <div className={styles.statDescription}>{stat.description}</div>
    </div>
  );
};

export default StatsCard;