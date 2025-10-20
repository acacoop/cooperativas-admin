import React from 'react';
import styles from './MetricsCard.module.css';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'gray';
}

export function MetricsCard({ title, value, subtitle, icon, trend, color = 'blue' }: MetricsCardProps) {
  return (
    <div className={`${styles.card} ${styles[`card${color.charAt(0).toUpperCase() + color.slice(1)}`]}`}>
      <div className={styles.header}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <h3 className={styles.title}>{title}</h3>
      </div>
      <div className={styles.value}>{value}</div>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      {trend && (
        <div className={`${styles.trend} ${trend.isPositive ? styles.trendPositive : styles.trendNegative}`}>
          <span className={styles.trendIcon}>{trend.isPositive ? '↗' : '↘'}</span>
          <span className={styles.trendValue}>{Math.abs(trend.value)}%</span>
          <span className={styles.trendLabel}>vs. mes anterior</span>
        </div>
      )}
    </div>
  );
}
