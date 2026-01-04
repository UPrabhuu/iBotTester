import React from 'react';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  /**
   * Visual variant of the badge
   */
  variant?: BadgeVariant;
  /**
   * Size of the badge
   */
  size?: BadgeSize;
  /**
   * Whether to use outlined style
   */
  outlined?: boolean;
  /**
   * Icon to display before the badge text
   */
  icon?: React.ReactNode;
  /**
   * Whether the badge is a dot indicator (small circle)
   */
  dot?: boolean;
  /**
   * CSS class name
   */
  className?: string;
  /**
   * Children elements (badge text)
   */
  children?: React.ReactNode;
  /**
   * Additional HTML attributes
   */
  [key: string]: any;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  outlined = false,
  icon,
  dot = false,
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const variantStyles: Record<BadgeVariant, { solid: string; outlined: string }> = {
    default: {
      solid: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200',
      outlined: 'border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 bg-transparent',
    },
    primary: {
      solid: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      outlined: 'border border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-400 bg-transparent',
    },
    success: {
      solid: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      outlined: 'border border-green-300 dark:border-green-600 text-green-700 dark:text-green-400 bg-transparent',
    },
    warning: {
      solid: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
      outlined: 'border border-yellow-300 dark:border-yellow-600 text-yellow-700 dark:text-yellow-400 bg-transparent',
    },
    danger: {
      solid: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      outlined: 'border border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 bg-transparent',
    },
    info: {
      solid: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      outlined: 'border border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-400 bg-transparent',
    },
  };

  const sizeStyles: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  };

  const dotSizeStyles: Record<BadgeSize, string> = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const selectedVariantStyle = outlined
    ? variantStyles[variant].outlined
    : variantStyles[variant].solid;

  if (dot) {
    return (
      <span
        className={`${baseStyles} ${selectedVariantStyle} ${sizeStyles[size]} ${className}`.trim()}
        {...props}
      >
        <span className={`${dotSizeStyles[size]} rounded-full bg-current`} />
        {children && <span>{children}</span>}
      </span>
    );
  }

  return (
    <span
      className={`${baseStyles} ${selectedVariantStyle} ${sizeStyles[size]} ${className}`.trim()}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
