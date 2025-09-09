interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  className?: string;
}

export function Alert({ type, message, className = '' }: AlertProps) {
  return (
    <div className={`alert-aca alert-${type} ${className}`} role="alert">
      {message}
    </div>
  );
}

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Cargando...' }: LoadingSpinnerProps) {
  return (
    <div className="card-aca text-center py-12">
      <div className="spinner-aca mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`card-aca ${className}`}>
      {title && <h3 className="mb-4">{title}</h3>}
      {children}
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  loading?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  loading = false, 
  className = '', 
  ...props 
}: ButtonProps) {
  const baseClasses = 'btn-aca';
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700',
    secondary: 'bg-gray-600 hover:bg-gray-700',
    danger: 'bg-red-600 hover:bg-red-700',
    success: 'bg-green-600 hover:bg-green-700'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="spinner-aca mr-2"></div>
          Procesando...
        </div>
      ) : children}
    </button>
  );
}
