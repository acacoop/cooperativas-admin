import Link from 'next/link';
import { Cooperative } from '@/types';
import styles from './CoopCard.module.css';

interface CoopCardProps {
  cooperative: Cooperative;
  className?: string;
}

export default function CoopCard({ cooperative, className = "" }: CoopCardProps) {
  return (
    <Link 
      href={`/cooperativas/${cooperative.id}`}
      className={`${styles.cardContainer} ${className}`}
    >
      <div className={styles.cardContent}>
        <div className={styles.cardMain}>
          {/* Nombre y estado */}
          <div className={styles.header}>
            <h3 className={styles.title}>
              {cooperative.name}
            </h3>
            <span className={styles.statusBadge}>
              ✓ Activa
            </span>
          </div>

          {/* Información principal */}
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={`${styles.icon} ${styles.iconBlue}`}>
                #{cooperative.code}
              </span>
              <div className={styles.infoText}>
                <div className={styles.label}>Código</div>
                <div className={styles.value}>{cooperative.code}</div>
              </div>
            </div>
            
            <div className={styles.infoItem}>
              <span className={`${styles.icon} ${styles.iconGreen}`}>
                🏢
              </span>
              <div className={styles.infoText}>
                <div className={styles.label}>CUIT</div>
                <div className={styles.value}>{cooperative.cuit}</div>
              </div>
            </div>

            <div className={styles.infoItem}>
              <span className={`${styles.icon} ${styles.iconOrange}`}>
                📍
              </span>
              <div className={styles.infoText}>
                <div className={styles.label}>CAR</div>
                <div className={styles.value}>
                  {cooperative.car_name || `Región ${cooperative.car}`}
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className={styles.additionalInfo}>
            <div className={styles.infoRow}>
              <span className={styles.dotBlue}></span>
              <span className={styles.infoLabel}>Presidente:</span>
              <span className={styles.infoValueBlue}>
                {cooperative.president || 'No especificado'}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.dotGreen}></span>
              <span className={styles.infoLabel}>Estado:</span>
              <span className={styles.infoValueGreen}>Activa</span>
            </div>
          </div>
        </div>

        {/* Icono de flecha */}
        <div className={styles.arrowContainer}>
          <span className={styles.arrowIcon}>
            <svg className={styles.arrowSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}