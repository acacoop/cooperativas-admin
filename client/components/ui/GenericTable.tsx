import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export interface TableColumn<T = any> {
  key: string;
  title: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, record: T, index: number) => React.ReactNode;
  className?: string;
}

export interface TableAction<T = any> {
  label: string;
  onClick: (record: T, index: number) => void;
  className?: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'warning' | 'danger';
}

interface GenericTableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyState?: {
    icon?: string;
    title: string;
    description: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  actions?: TableAction<T>[];
  onRowClick?: (record: T, index: number) => void;
  className?: string;
  rowClassName?: string | ((record: T, index: number) => string);
}

export const GenericTable = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyState,
  actions,
  onRowClick,
  className = '',
  rowClassName = ''
}: GenericTableProps<T>) => {
  const getVariantClasses = (variant?: string) => {
    switch (variant) {
      case 'primary':
        return 'text-blue-600 hover:text-blue-800';
      case 'secondary':
        return 'text-gray-600 hover:text-gray-800';
      case 'warning':
        return 'text-orange-600 hover:text-orange-800';
      case 'danger':
        return 'text-red-600 hover:text-red-800';
      default:
        return 'text-blue-600 hover:text-blue-800';
    }
  };

  const getRowClasses = (record: T, index: number) => {
    const baseClasses = 'hover:bg-gray-50';
    const clickableClasses = onRowClick ? 'cursor-pointer' : '';
    const customClasses = typeof rowClassName === 'function' 
      ? rowClassName(record, index) 
      : rowClassName;
    
    return `${baseClasses} ${clickableClasses} ${customClasses}`.trim();
  };

  const getCellValue = (record: T, column: TableColumn<T>) => {
    const keys = column.key.split('.');
    let value = record;
    
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined || value === null) break;
    }
    
    return value;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        {emptyState.icon && (
          <div className="text-6xl mb-4">{emptyState.icon}</div>
        )}
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          {emptyState.title}
        </h3>
        <p className="text-gray-600 mb-6">
          {emptyState.description}
        </p>
        {emptyState.action && (
          <button
            onClick={emptyState.action.onClick}
            className="btn-aca"
          >
            {emptyState.action.label}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase ${
                  column.align === 'center' ? 'text-center' :
                  column.align === 'right' ? 'text-right' : 'text-left'
                } ${column.className || ''}`}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.title}
              </th>
            ))}
            {actions && actions.length > 0 && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((record, index) => (
            <tr
              key={index}
              className={getRowClasses(record, index)}
              onClick={() => onRowClick?.(record, index)}
            >
              {columns.map((column) => {
                const value = getCellValue(record, column);
                const displayValue: React.ReactNode = column.render 
                  ? column.render(value, record, index)
                  : String(value ?? '');

                return (
                  <td
                    key={column.key}
                    className={`px-6 py-4 ${
                      column.align === 'center' ? 'text-center' :
                      column.align === 'right' ? 'text-right' : 'text-left'
                    } ${column.className || ''}`}
                  >
                    {displayValue}
                  </td>
                );
              })}
              {actions && actions.length > 0 && (
                <td className="px-6 py-4 text-right space-x-2">
                  {actions.map((action, actionIndex) => (
                    <button
                      key={actionIndex}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click when action is clicked
                        action.onClick(record, index);
                      }}
                      className={`text-sm ${getVariantClasses(action.variant)} ${action.className || ''}`}
                    >
                      {action.icon && <span className="mr-1">{action.icon}</span>}
                      {action.label}
                    </button>
                  ))}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GenericTable;