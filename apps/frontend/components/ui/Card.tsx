import React from 'react';

export type CardVariant = 'default' | 'bordered' | 'elevated';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Visual variant of the card
   */
  variant?: CardVariant;
  /**
   * Whether the card should have hover effects
   */
  hoverable?: boolean;
  /**
   * Whether the card should have padding
   */
  noPadding?: boolean;
  /**
   * Children elements (card content)
   */
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  hoverable = false,
  noPadding = false,
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'bg-white rounded-xl transition-all duration-200';

  const variantStyles: Record<CardVariant, string> = {
    default: 'border border-neutral-200',
    bordered: 'border-2 border-neutral-300',
    elevated: 'shadow-medium',
  };

  const hoverStyles = hoverable
    ? 'cursor-pointer hover:shadow-strong hover:-translate-y-0.5'
    : '';

  const paddingStyles = noPadding ? '' : 'p-6';

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${paddingStyles} ${className}`.trim();

  return (
    <div className={combinedClassName} {...props}>
      {children}
    </div>
  );
};

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`mb-4 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '', ...props }) => {
  return (
    <h3 className={`text-xl font-semibold text-neutral-900 ${className}`.trim()} {...props}>
      {children}
    </h3>
  );
};

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className = '', ...props }) => {
  return (
    <p className={`text-sm text-neutral-600 mt-1 ${className}`.trim()} {...props}>
      {children}
    </p>
  );
};

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`mt-4 pt-4 border-t border-neutral-200 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};

export default Card;
