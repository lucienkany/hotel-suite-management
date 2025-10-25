// frontend/app/components/Card/Card.tsx
'use client';
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  footer,
  className = '',
  padding = 'md',
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}
    >
      {(title || subtitle) && (
        <div className={`border-b border-gray-200 ${paddingClasses[padding]}`}>
          {title && (
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          )}
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      )}

      <div className={paddingClasses[padding]}>{children}</div>

      {footer && (
        <div
          className={`border-t border-gray-200 bg-gray-50 ${paddingClasses[padding]}`}
        >
          {footer}
        </div>
      )}
    </div>
  );
};
