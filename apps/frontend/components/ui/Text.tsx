import React from 'react';

export type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /**
   * HTML element to render as
   */
  as?: 'p' | 'span' | 'div' | 'label';
  /**
   * Size of the text
   */
  size?: TextSize;
  /**
   * Font weight
   */
  weight?: TextWeight;
  /**
   * Text color
   */
  color?: string;
  /**
   * Whether to truncate text with ellipsis
   */
  truncate?: boolean;
  /**
   * Children elements (text content)
   */
  children: React.ReactNode;
}

const Text: React.FC<TextProps> = ({
  as: Component = 'p',
  size = 'base',
  weight = 'normal',
  color = 'text-neutral-700',
  truncate = false,
  className = '',
  children,
  ...props
}) => {
  const sizeStyles: Record<TextSize, string> = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const weightStyles: Record<TextWeight, string> = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const truncateStyles = truncate ? 'truncate' : '';

  const combinedClassName = `${sizeStyles[size]} ${weightStyles[weight]} ${color} ${truncateStyles} ${className}`.trim();

  return (
    <Component className={combinedClassName} {...props}>
      {children}
    </Component>
  );
};

export default Text;
