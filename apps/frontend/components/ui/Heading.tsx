import React from 'react';

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type HeadingWeight = 'normal' | 'medium' | 'semibold' | 'bold';

export interface HeadingProps {
  /**
   * Heading level (h1-h6)
   */
  as?: HeadingLevel;
  /**
   * Font weight of the heading
   */
  weight?: HeadingWeight;
  /**
   * Text color class
   */
  color?: string;
  /**
   * Whether to apply gradient text effect
   */
  gradient?: boolean;
  /**
   * CSS class name
   */
  className?: string;
  /**
   * Children elements (heading text)
   */
  children: React.ReactNode;
  /**
   * Additional HTML attributes
   */
  [key: string]: any;
}

const Heading: React.FC<HeadingProps> = ({
  as: Component = 'h2',
  weight = 'bold',
  color = 'text-neutral-900 dark:text-neutral-50',
  gradient = false,
  className = '',
  children,
  ...props
}) => {
  const sizeStyles: Record<HeadingLevel, string> = {
    h1: 'text-4xl md:text-5xl',
    h2: 'text-3xl md:text-4xl',
    h3: 'text-2xl md:text-3xl',
    h4: 'text-xl md:text-2xl',
    h5: 'text-lg md:text-xl',
    h6: 'text-base md:text-lg',
  };

  const weightStyles: Record<HeadingWeight, string> = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const gradientStyles = gradient
    ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
    : color;

  const combinedClassName = `${sizeStyles[Component]} ${weightStyles[weight]} ${gradientStyles} ${className}`.trim();

  return (
    <Component className={combinedClassName} {...props}>
      {children}
    </Component>
  );
};

export default Heading;
