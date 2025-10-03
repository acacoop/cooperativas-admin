import React from 'react';
import styles from './StatsCard.module.css';

export interface StatItem {
  id: string;
  value: string | number;
  label: string;
  description?: string;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow' | 'gray';
  icon?: string;
}

interface StatsCardProps {
  stat: StatItem;
  layout?: 'centered' | 'split'; // 'centered' = icon with value, 'split' = value left, icon right
}

export const StatsCard: React.FC<StatsCardProps> = ({ stat, layout = 'centered' }) => {
  if (layout === 'split') {
    return (
      <div className={`${styles.statCard} ${styles[`statCard--${stat.color}`]} ${styles['statCard--split']}`}>
        <div className={styles.splitContent}>
          <div className={styles.splitLeft}>
            <p className={styles.splitLabel}>{stat.label}</p>
            <p className={styles.splitValue}>{stat.value}</p>
          </div>
          {stat.icon && (
            <div className={styles.splitIcon}>{stat.icon}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.statCard} ${styles[`statCard--${stat.color}`]}`}>
      <div className={styles.statValue}>
        {stat.icon && <span className={styles.statIcon}>{stat.icon}</span>}
        {stat.value}
      </div>
      <div className={styles.statLabel}>{stat.label}</div>
      {stat.description && <div className={styles.statDescription}>{stat.description}</div>}
    </div>
  );
};

export default StatsCard;