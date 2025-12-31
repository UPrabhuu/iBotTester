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
      solid: 'bg-neutral-100 text-neutral-800',
      outlined: 'border border-neutral-300 text-neutral-700 bg-transparent',
    },
    primary: {
      solid: 'bg-blue-100 text-blue-800',
      outlined: 'border border-blue-300 text-blue-700 bg-transparent',
    },
    success: {
      solid: 'bg-green-100 text-green-800',
      outlined: 'border border-green-300 text-green-700 bg-transparent',
    },
    warning: {
      solid: 'bg-yellow-100 text-yellow-800',
      outlined: 'border border-yellow-300 text-yellow-700 bg-transparent',
    },
    danger: {
      solid: 'bg-red-100 text-red-800',
      outlined: 'border border-red-300 text-red-700 bg-transparent',
    },
    info: {
      solid: 'bg-blue-100 text-blue-800',
      outlined: 'border border-blue-300 text-blue-700 bg-transparent',
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
