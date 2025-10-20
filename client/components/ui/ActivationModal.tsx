import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { InformationCard } from './InformationCard';
import styles from './ActivationModal.module.css';

export interface AdminData {
  username: string;
  email: string;
  full_name: string;
  password: string;
  confirmPassword: string;
}

export interface CooperativeData {
  id: number;
  name: string;
  code: number;
  email?: string;
}

interface ActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  cooperative: CooperativeData | null;
  onSubmit: (adminData: AdminData) => Promise<void>;
  loading?: boolean;
}

export const ActivationModal: React.FC<ActivationModalProps> = ({
  isOpen,
  onClose,
  cooperative,
  onSubmit,
  loading = false
}) => {
  const [adminData, setAdminData] = useState<AdminData>({
    username: '',
    email: '',
    full_name: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Partial<AdminData>>({});

  // Reset form when modal opens with new cooperative
  useEffect(() => {
    if (isOpen && cooperative) {
      setAdminData({
        username: `admin_${cooperative.code}`,
        email: cooperative.email || '',
        full_name: `Admin ${cooperative.name}`,
        password: '',
        confirmPassword: ''
      });
      setErrors({});
    }
  }, [isOpen, cooperative]);

  const validateForm = (): boolean => {
    const newErrors: Partial<AdminData> = {};

    if (!adminData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    }

    if (!adminData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!adminData.full_name.trim()) {
      newErrors.full_name = 'El nombre completo es requerido';
    }

    if (!adminData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (adminData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (adminData.password !== adminData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(adminData);
    } catch (error) {
      // Error handling is done in parent component
      console.error('Error in ActivationModal:', error);
    }
  };

  const handleInputChange = (field: keyof AdminData, value: string) => {
    setAdminData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!cooperative) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Activar Cooperativa"
      subtitle={`Activarás: ${cooperative.name}`}
      maxWidth="lg"
      closeOnBackdropClick={!loading}
    >
      <InformationCard
        title="⚠️ Importante:"
        variant="warning"
        items={[
          'Se creará un usuario administrador para esta cooperativa',
          'Este usuario podrá gestionar usuarios y proveedores de su cooperativa',
          'Enviarás las credenciales al correo de la cooperativa'
        ]}
        className="mb-6"
      />

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>
              Nombre de Usuario *
            </label>
            <input
              id="username"
              type="text"
              required
              value={adminData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className={`${styles.input} ${errors.username ? styles.inputError : ''}`}
              placeholder="admin_cooperativa"
              disabled={loading}
            />
            {errors.username && (
              <span className={styles.errorText}>{errors.username}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email *
            </label>
            <input
              id="email"
              type="email"
              required
              value={adminData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              placeholder="admin@cooperativa.com"
              disabled={loading}
            />
            {errors.email && (
              <span className={styles.errorText}>{errors.email}</span>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="full_name" className={styles.label}>
            Nombre Completo *
          </label>
          <input
            id="full_name"
            type="text"
            required
            value={adminData.full_name}
            onChange={(e) => handleInputChange('full_name', e.target.value)}
            className={`${styles.input} ${errors.full_name ? styles.inputError : ''}`}
            placeholder="Administrador de la Cooperativa"
            disabled={loading}
          />
          {errors.full_name && (
            <span className={styles.errorText}>{errors.full_name}</span>
          )}
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Contraseña *
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={adminData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              placeholder="Mínimo 6 caracteres"
              disabled={loading}
            />
            {errors.password && (
              <span className={styles.errorText}>{errors.password}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirmar Contraseña *
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={6}
              value={adminData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
              placeholder="Repite la contraseña"
              disabled={loading}
            />
            {errors.confirmPassword && (
              <span className={styles.errorText}>{errors.confirmPassword}</span>
            )}
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className={styles.cancelButton}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                Activando...
              </div>
            ) : (
              '✅ Activar Cooperativa'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ActivationModal;