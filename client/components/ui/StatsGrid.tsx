import React from 'react';
import StatsCard, { StatItem } from './StatsCard';
import styles from './StatsGrid.module.css';

interface StatsGridProps {
  title?: string;
  subtitle?: string;
  stats: StatItem[];
  className?: string;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ 
  title = "Estadísticas", 
  subtitle,
  stats, 
  className = "" 
}) => {
  return (
    <div className={`${styles.statsContainer} ${className}`}>
      {title && (
        <h3 className={styles.statsTitle}>
          {title}
        </h3>
      )}
      {subtitle && (
        <p className={styles.statsSubtitle}>
          {subtitle}
        </p>
      )}
      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <StatsCard key={stat.id} stat={stat} />
        ))}
      </div>
    </div>
  );
};

export default StatsGrid;