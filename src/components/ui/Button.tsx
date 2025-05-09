import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600 border-transparent',
    secondary: 'bg-red-700 text-white hover:bg-red-800 border-transparent',
    outline: 'bg-transparent text-orange-500 hover:bg-orange-50 border-orange-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 border-transparent',
    danger: 'bg-red-500 text-white hover:bg-red-600 border-transparent',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button
      className={cn(
        'rounded font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          <span>読み込み中...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;