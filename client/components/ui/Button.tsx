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
