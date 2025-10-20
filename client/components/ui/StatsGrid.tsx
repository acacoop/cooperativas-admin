import React from 'react';
import StatsCard, { StatItem } from './StatsCard';
import styles from './StatsGrid.module.css';

interface StatsGridProps {
  title?: string;
  subtitle?: string;
  stats: StatItem[];
  className?: string;
  centered?: boolean;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ 
  title = "Estadísticas", 
  subtitle,
  stats, 
  className = "",
  centered = false
}) => {
  // Determine grid class based on number of items
  const getGridClass = () => {
    if (!centered) return styles['statsGrid--centered'];
    
    const itemCount = stats.length;
    if (itemCount === 3) return styles['statsGrid--threeItems'];
    if (itemCount === 5) return styles['statsGrid--fiveItems'];
    
    return '';
  };

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
      <div className={`${styles.statsGrid} ${getGridClass()}`}>
        {stats.map((stat) => (
          <StatsCard key={stat.id} stat={stat} />
        ))}
      </div>
    </div>
  );
};

export default StatsGrid;