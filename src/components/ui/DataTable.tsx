import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  actions?: React.ReactNode;
  filterComponent?: React.ReactNode;
  pageSize?: number;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchPlaceholder = 'Search records...',
  searchKeys = [],
  actions,
  filterComponent,
  pageSize = 10,
  emptyMessage = 'No records found',
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    return data.filter((item) => {
      if (searchKeys.length > 0) {
        return searchKeys.some((k) => {
          const val = item[k];
          return val !== undefined && val !== null && String(val).toLowerCase().includes(term);
        });
      }
      return Object.values(item).some((val) => {
        return val !== undefined && val !== null && String(val).toLowerCase().includes(term);
      });
    });
  }, [data, searchTerm, searchKeys]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      return sortOrder === 'asc' ? 1 : -1;
    });
  }, [filteredData, sortKey, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <div className="table-container">
      {/* Toolbar */}
      <div className="table-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <div className="search-input-wrapper">
            <Search size={15} />
            <input
              type="text"
              className="form-control"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          {filterComponent}
        </div>
        {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{actions}</div>}
      </div>

      {/* Table */}
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width, cursor: col.sortable ? 'pointer' : 'default' }}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {col.header}
                  {col.sortable && (
                    <ArrowUpDown
                      size={13}
                      style={{
                        opacity: sortKey === col.key ? 1 : 0.4,
                        color: sortKey === col.key ? 'var(--accent-red)' : 'inherit',
                      }}
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            paginatedData.map((item, idx) => (
              <tr key={item.id || idx}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(item) : item[col.key] !== undefined && item[col.key] !== null ? String(item[col.key]) : '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: 12.5,
          color: 'var(--text-muted)',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <div>
          Showing {sortedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} records
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span style={{ padding: '0 6px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {currentPage} / {totalPages}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
