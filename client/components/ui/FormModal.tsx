import React from 'react';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'password' | 'textarea' | 'select' | 'number';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  rows?: number; // For textarea
  colSpan?: 1 | 2; // For grid layout
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface FormAction {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  type?: 'submit' | 'button';
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  fields: FormField[];
  formData: Record<string, any>;
  onFormDataChange: (data: Record<string, any>) => void;
  onSubmit: (e: React.FormEvent) => void;
  actions?: FormAction[];
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  gridCols?: 1 | 2;
  loading?: boolean;
  className?: string;
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  fields,
  formData,
  onFormDataChange,
  onSubmit,
  actions,
  maxWidth = 'md',
  gridCols = 1,
  loading = false,
  className = ''
}) => {
  if (!isOpen) return null;

  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case '2xl': return 'max-w-2xl';
      default: return 'max-w-md';
    }
  };

  const getActionVariantClasses = (variant?: string) => {
    switch (variant) {
      case 'primary':
        return 'btn-aca';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors';
      case 'secondary':
      default:
        return 'px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors';
    }
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    onFormDataChange({
      ...formData,
      [fieldName]: value
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderField = (field: FormField) => {
    const baseInputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors";
    const colSpanClass = field.colSpan === 2 && gridCols === 2 ? 'md:col-span-2' : '';

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.name} className={colSpanClass}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={formData[field.name] || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className={baseInputClasses}
              placeholder={field.placeholder}
              required={field.required}
              rows={field.rows || 3}
              disabled={loading}
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className={colSpanClass}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={formData[field.name] || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className={baseInputClasses}
              required={field.required}
              disabled={loading}
            >
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      default:
        return (
          <div key={field.name} className={colSpanClass}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.type}
              value={formData[field.name] || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className={baseInputClasses}
              placeholder={field.placeholder}
              required={field.required}
              disabled={loading}
              minLength={field.validation?.minLength}
              maxLength={field.validation?.maxLength}
              pattern={field.validation?.pattern}
            />
          </div>
        );
    }
  };

  // Default actions if none provided
  const defaultActions: FormAction[] = actions || [
    {
      label: 'Cancelar',
      variant: 'secondary',
      type: 'button',
      onClick: onClose
    },
    {
      label: 'Guardar',
      variant: 'primary',
      type: 'submit',
      loading
    }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className={`bg-white rounded-lg shadow-xl ${getMaxWidthClass()} w-full max-h-[90vh] overflow-y-auto ${className}`}>
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <span className="sr-only">Cerrar</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={onSubmit} className="p-6">
          <div className={`grid grid-cols-1 ${gridCols === 2 ? 'md:grid-cols-2' : ''} gap-4`}>
            {fields.map(renderField)}
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            {defaultActions.map((action, index) => (
              <button
                key={index}
                type={action.type || 'button'}
                onClick={action.onClick}
                disabled={action.disabled || loading}
                className={`flex-1 ${getActionVariantClasses(action.variant)} ${
                  action.disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {action.loading || (loading && action.type === 'submit') ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </div>
                ) : (
                  action.label
                )}
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormModal;