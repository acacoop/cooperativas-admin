import React from 'react';
import ScrollView from './ScrollView';
import styles from './DataTable.module.css';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyState?: React.ReactNode;
  onRowClick?: (item: T) => void;
  className?: string;
  keyExtractor: (item: T) => string | number;
  rowClassName?: (item: T) => string;
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  emptyState,
  onRowClick,
  className = '',
  keyExtractor,
  rowClassName
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="spinner-aca"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        {emptyState || (
          <>
            <div className={styles.emptyIcon}>🔍</div>
            <h3 className={styles.emptyTitle}>No se encontraron resultados</h3>
            <p className={styles.emptyDescription}>
              Intenta ajustar los filtros de búsqueda
            </p>
          </>
        )}
      </div>
    );
  }

  const getAlignClass = (align?: string) => {
    switch (align) {
      case 'center': return styles.textCenter;
      case 'right': return styles.textRight;
      default: return styles.textLeft;
    }
  };

  return (
    <div className={`${styles.tableContainer} ${className}`}>
      <ScrollView>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${styles.tableHeader} ${getAlignClass(column.align)} ${column.className || ''}`}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className={`${styles.tableRow} ${rowClassName ? rowClassName(item) : ''}`}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`${styles.tableCell} ${getAlignClass(column.align)} ${column.className || ''}`}
                  >
                    {column.render ? column.render(item) : (item as any)[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollView>
    </div>
  );
}

export default DataTable;