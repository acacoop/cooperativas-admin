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
