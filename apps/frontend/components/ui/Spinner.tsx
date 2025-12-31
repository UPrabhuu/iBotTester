import React from 'react';
import { Loader2 } from 'lucide-react';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'primary' | 'secondary' | 'white';

export interface SpinnerProps {
  /**
   * Size of the spinner
   */
  size?: SpinnerSize;
  /**
   * Color variant of the spinner
   */
  variant?: SpinnerVariant;
  /**
   * Label text to display next to the spinner
   */
  label?: string;
  /**
   * Whether to center the spinner in its container
   */
  centered?: boolean;
  /**
   * CSS class name
   */
  className?: string;
  /**
   * Additional HTML attributes
   */
  [key: string]: any;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  label,
  centered = false,
  className = '',
  ...props
}) => {
  const sizeStyles: Record<SpinnerSize, { icon: number; text: string }> = {
    xs: { icon: 12, text: 'text-xs' },
    sm: { icon: 16, text: 'text-sm' },
    md: { icon: 24, text: 'text-base' },
    lg: { icon: 32, text: 'text-lg' },
    xl: { icon: 40, text: 'text-xl' },
  };

  const variantStyles: Record<SpinnerVariant, string> = {
    primary: 'text-blue-600',
    secondary: 'text-neutral-600',
    white: 'text-white',
  };

  const containerClassName = centered
    ? 'flex items-center justify-center'
    : 'inline-flex items-center';

  return (
    <div className={`${containerClassName} gap-3 ${className}`.trim()} {...props}>
      <Loader2
        className={`animate-spin ${variantStyles[variant]}`}
        size={sizeStyles[size].icon}
      />
      {label && (
        <span className={`${sizeStyles[size].text} ${variantStyles[variant]} font-medium`}>
          {label}
        </span>
      )}
    </div>
  );
};

export default Spinner;
