import React from 'react';

interface InformationCardProps {
  title?: string;
  items: (string | React.ReactNode)[];
  variant?: 'info' | 'warning' | 'success' | 'error';
  className?: string;
}

export const InformationCard: React.FC<InformationCardProps> = ({
  title = "ℹ️ Información importante",
  items,
  variant = 'info',
  className = ''
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'info':
        return '!bg-blue-50 !border-blue-200 text-blue-800';
      case 'warning':
        return '!bg-yellow-50 !border-yellow-200 text-yellow-800';
      case 'success':
        return '!bg-green-50 !border-green-200 text-green-800';
      case 'error':
        return '!bg-red-50 !border-red-200 text-red-800';
      default:
        return '!bg-blue-50 !border-blue-200 text-blue-800';
    }
  };

  const getTextClasses = () => {
    switch (variant) {
      case 'info':
        return 'text-blue-700';
      case 'warning':
        return 'text-yellow-700';
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      default:
        return 'text-blue-700';
    }
  };

  return (
    <div className={`card-aca mb-6 ${getVariantClasses()} ${className}`}>
      <h3 className="mb-3">{title}</h3>
      <ul className={`text-sm ${getTextClasses()} space-y-1`}>
        {items.map((item, index) => (
          <li key={index}>• {item}</li>
        ))}
      </ul>
    </div>
  );
};

export default InformationCard;