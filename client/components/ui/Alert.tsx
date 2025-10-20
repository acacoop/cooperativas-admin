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
