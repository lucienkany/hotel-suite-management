'use client';
import React from 'react';
import { Pagination } from '../Pagination/Pagination';

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  sort: string;
  setSort: (sort: string) => void;
  setPage: (page: number) => void;
  filters?: Record<string, any>;
  setFilters?: (filters: Record<string, any>) => void;
  filterFields?: {
    key: string;
    label: string;
    type?: 'text' | 'select';
    options?: string[];
  }[];
}

export function DataTable<T>({
  columns,
  data,
  total,
  page,
  pageSize,
  loading,
  sort,
  setSort,
  setPage,
  filters = {},
  setFilters,
  filterFields = [],
}: DataTableProps<T>) {
  const [sortKey, sortDir] = sort.split(':');

  const handleSort = (colKey: string) => {
    if (sortKey === colKey) {
      setSort(`${colKey}:${sortDir === 'asc' ? 'desc' : 'asc'}`);
    } else {
      setSort(`${colKey}:asc`);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    if (setFilters) setFilters({ ...filters, [key]: value });
  };

  return (
    <div className="w-full">
      {filterFields.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4">
          {filterFields.map((field) => (
            <div key={field.key} className="flex flex-col">
              <label className="text-sm font-medium mb-1 text-gray-600">
                {field.label}
              </label>
              {field.type === 'select' && field.options ? (
                <select
                  className="border rounded-md px-2 py-1"
                  value={filters[field.key] ?? ''}
                  onChange={(e) =>
                    handleFilterChange(field.key, e.target.value)
                  }
                >
                  <option value="">All</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="border rounded-md px-2 py-1"
                  type="text"
                  value={filters[field.key] ?? ''}
                  onChange={(e) =>
                    handleFilterChange(field.key, e.target.value)
                  }
                  placeholder={`Filter ${field.label}`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                  className={`px-4 py-2 text-left text-sm font-semibold text-gray-700 ${
                    col.sortable
                      ? 'cursor-pointer hover:bg-gray-200'
                      : 'cursor-default'
                  }`}
                >
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    <span className="ml-1">
                      {sortDir === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-6 text-center text-gray-400"
                >
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-6 text-center text-gray-400"
                >
                  No results found.
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className="px-4 py-2 text-sm text-gray-700"
                    >
                      {col.render ? col.render(row) : (row[col.key] as any)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalItems={total}
        itemsPerPage={pageSize}
        onPageChange={setPage}
      />
    </div>
  );
}
