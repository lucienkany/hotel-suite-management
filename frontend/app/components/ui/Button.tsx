import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow',
    secondary:
      'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 shadow-sm hover:shadow',
    outline:
      'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    destructive:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

// // frontend/src/components/ui/Button.tsx
// import { ButtonHTMLAttributes, forwardRef } from 'react';
// import { cn } from '../../lib/utils';

// interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
//   variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
//   size?: 'sm' | 'md' | 'lg';
//   isLoading?: boolean;
// }

// export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
//   (
//     {
//       className,
//       variant = 'primary',
//       size = 'md',
//       isLoading,
//       children,
//       disabled,
//       ...props
//     },
//     ref
//   ) => {
//     const baseStyles =
//       'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

//     const variants = {
//       primary:
//         'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
//       secondary:
//         'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
//       outline:
//         'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
//       ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
//       danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
//     };

//     const sizes = {
//       sm: 'px-3 py-1.5 text-sm',
//       md: 'px-4 py-2 text-base',
//       lg: 'px-6 py-3 text-lg',
//     };

//     return (
//       <button
//         ref={ref}
//         className={cn(baseStyles, variants[variant], sizes[size], className)}
//         disabled={disabled || isLoading}
//         {...props}
//       >
//         {isLoading && (
//           <svg
//             className="animate-spin -ml-1 mr-2 h-4 w-4"
//             fill="none"
//             viewBox="0 0 24 24"
//           >
//             <circle
//               className="opacity-25"
//               cx="12"
//               cy="12"
//               r="10"
//               stroke="currentColor"
//               strokeWidth="4"
//             />
//             <path
//               className="opacity-75"
//               fill="currentColor"
//               d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//             />
//           </svg>
//         )}
//         {children}
//       </button>
//     );
//   }
// );

// Button.displayName = 'Button';
