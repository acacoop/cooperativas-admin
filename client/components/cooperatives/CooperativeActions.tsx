import React from 'react';
import { Cooperative } from '@/types';
import styles from './CooperativeActions.module.css';

interface CooperativeActionsProps {
  cooperative: Cooperative;
  onActivate: (coop: Cooperative) => void;
  onViewDetails?: (coop: Cooperative) => void;
  onDeactivate?: (coop: Cooperative) => void;
}

export const CooperativeActions: React.FC<CooperativeActionsProps> = ({
  cooperative,
  onActivate,
  onViewDetails,
  onDeactivate
}) => {
  if (cooperative.invoice_system_active === 1) {
    return (
      <div className={styles.actionsContainer}>
        {onViewDetails && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(cooperative);
            }}
            className={styles.detailsButton}
          >
            Ver detalles
          </button>
        )}
        {onDeactivate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeactivate(cooperative);
            }}
            className={styles.deactivateButton}
          >
            Desactivar
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onActivate(cooperative);
      }}
      className={styles.activateButton}
    >
      ✅ Activar Sistema
    </button>
  );
};

export default CooperativeActions;