import Link from 'next/link';
import styles from './MenuCard.module.css';
import { FC } from 'react';

interface MenuCardProps {
  href?: string;
  icon: string;
  title: string;
  subtitle: string;
  footerText: string;
  gradientFrom?: string;
  gradientTo?: string;
  hoverColor?: string;
  className?: string;
}

const MenuCard: FC<MenuCardProps> = ({ 
  href, 
  icon, 
  title, 
  subtitle, 
  footerText,
  gradientFrom,
  gradientTo,
  hoverColor,
  className
}) => {
  const cardContent = (
    <div className={className ? className : `card-aca ${href ? 'group cursor-pointer' : ''}`}>
      <div className={styles.container}>
        <div 
          className={styles.iconContainer} 
          style={{
            background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})`
          }}
        >
          {icon}
        </div>
        <div className={styles.content}>
          <h3 className={`${styles.title} ${href ? `group-hover:text-[${hoverColor}]` : ''}`}>
            {title}
          </h3>
          <p className={styles.subtitle}>{subtitle}</p>
          <p className={styles.footerText} style={{ color: hoverColor }}>
            {footerText}
          </p>
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{cardContent}</Link>;
  }

  return cardContent;
};

export default MenuCard;
