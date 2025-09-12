import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useAuth } from '../../utils/AuthContext';
import Aviso from '../ui/Aviso';
import styles from './LoginForm.module.css';

interface Credentials {
  username: string;
  password: string;
}

interface LoginFormProps {
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ className = '' }) => {
  const [credentials, setCredentials] = useState<Credentials>({
    username: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(credentials.username, credentials.password);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={`${styles.formContainer} ${className}`}>
      <div className={styles.loginCard}>
        <h3 className={styles.loginTitle}>Iniciar Sesión</h3>
        
        {error && (
          <div className="alert-aca alert-error mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className="form-group-aca">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              placeholder="Ingresa tu usuario"
              value={credentials.username}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group-aca">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Ingresa tu contraseña"
              value={credentials.password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn-aca w-full"
            disabled={loading}
          >
            {loading ? (
              <div className={styles.loadingContent}>
                <div className="spinner-aca mr-2"></div>
                Ingresando...
              </div>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        {/* Información de usuarios de prueba */}
        <Aviso 
          type="info" 
          title="👥 Usuarios de Prueba (MVP)"
        >
          <div><strong>Admin ACA:</strong> admin_aca / admin123</div>
          <div><strong>Operador ACA:</strong> operador_aca / operador123</div>
          <div><strong>Admin Cooperativa:</strong> admin_coop_1 / coop123</div>
          <div><strong>🚚 Proveedor:</strong> proveedor_test / proveedor123</div>
        </Aviso>
      </div>
    </div>
  );
};

export default LoginForm;