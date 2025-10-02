import React from 'react';
import styles from './ChartCard.module.css';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface ChartCardProps {
  title: string;
  data: ChartData[];
  type: 'bar' | 'pie' | 'line';
}

export function ChartCard({ title, data, type }: ChartCardProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const renderBarChart = () => (
    <div className={styles.barChart}>
      {data.map((item, index) => (
        <div key={index} className={styles.barItem}>
          <div className={styles.barLabel}>{item.label}</div>
          <div className={styles.barWrapper}>
            <div 
              className={styles.bar}
              style={{ 
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color 
              }}
            >
              <span className={styles.barValue}>{item.value}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPieChart = () => (
    <div className={styles.pieChart}>
      <div className={styles.pieContainer}>
        {data.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={index} className={styles.pieSegment}>
              <div 
                className={styles.pieColor}
                style={{ backgroundColor: item.color }}
              />
              <div className={styles.pieLabel}>
                <span className={styles.pieName}>{item.label}</span>
                <span className={styles.pieValue}>
                  {item.value} ({percentage}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderLineChart = () => (
    <div className={styles.lineChart}>
      {data.map((item, index) => (
        <div key={index} className={styles.lineItem}>
          <div className={styles.lineLabel}>{item.label}</div>
          <div className={styles.lineWrapper}>
            <div 
              className={styles.line}
              style={{ 
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color 
              }}
            />
          </div>
          <div className={styles.lineValue}>{item.value}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.chartContent}>
        {type === 'bar' && renderBarChart()}
        {type === 'pie' && renderPieChart()}
        {type === 'line' && renderLineChart()}
      </div>
    </div>
  );
}
