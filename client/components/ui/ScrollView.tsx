import { ReactNode } from 'react';
import styles from './ScrollView.module.css';

interface ScrollViewProps {
  children: ReactNode;
  height?: string;
  className?: string;
  showScrollbar?: boolean;
}

export default function ScrollView({ 
  children, 
  height = '500px', 
  className = '', 
  showScrollbar = true 
}: ScrollViewProps) {
  const scrollbarClass = showScrollbar ? styles.showScrollbar : styles.hideScrollbar;
  
  return (
    <div 
      className={`${styles.scrollContainer} ${scrollbarClass} ${className}`}
      style={{ maxHeight: height }}
    >
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}