import React, { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'elevated';
}

const Card: React.FC<CardProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const variantClasses = {
    default: 'bg-white',
    outline: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-md',
  };
  
  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn('p-4 border-b border-gray-100', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardContent: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('p-4', className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn('p-4 border-t border-gray-100', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;