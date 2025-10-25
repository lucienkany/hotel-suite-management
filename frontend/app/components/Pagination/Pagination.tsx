'use client';
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = '',
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  const getPages = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const showLeft = currentPage > 4;
      const showRight = currentPage < totalPages - 3;
      pages.push(1);
      if (showLeft) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (showRight) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className={`flex items-center justify-center gap-2 mt-6 ${className}`}>
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 border rounded-lg ${
          currentPage === 1
            ? 'text-gray-400 border-gray-300 bg-gray-100 cursor-not-allowed'
            : 'hover:bg-gray-200 border-gray-300 text-gray-700'
        }`}
      >
        ‹ Prev
      </button>

      {getPages().map((p, idx) =>
        p === '...' ? (
          <span key={idx} className="px-2 text-gray-500 select-none">
            ...
          </span>
        ) : (
          <button
            key={idx}
            onClick={() => handlePageChange(p as number)}
            className={`px-3 py-1 border rounded-lg ${
              p === currentPage
                ? 'bg-green-600 text-white border-green-600'
                : 'hover:bg-gray-200 text-gray-700 border-gray-300'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 border rounded-lg ${
          currentPage === totalPages
            ? 'text-gray-400 border-gray-300 bg-gray-100 cursor-not-allowed'
            : 'hover:bg-gray-200 border-gray-300 text-gray-700'
        }`}
      >
        Next ›
      </button>
    </div>
  );
};
