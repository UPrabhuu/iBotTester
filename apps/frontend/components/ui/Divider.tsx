import React from 'react';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed' | 'dotted';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Orientation of the divider
   */
  orientation?: DividerOrientation;
  /**
   * Visual variant of the divider
   */
  variant?: DividerVariant;
  /**
   * Optional label text to display in the middle of the divider
   */
  label?: string;
  /**
   * Color of the divider
   */
  color?: string;
}

const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'solid',
  label,
  color = 'border-neutral-200',
  className = '',
  ...props
}) => {
  const variantStyles: Record<DividerVariant, string> = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
  };

  if (orientation === 'vertical') {
    return (
      <div
        className={`inline-block h-full border-l ${variantStyles[variant]} ${color} ${className}`.trim()}
        role="separator"
        aria-orientation="vertical"
        {...props}
      />
    );
  }

  // Horizontal divider
  if (label) {
    return (
      <div
        className={`relative flex items-center ${className}`.trim()}
        role="separator"
        aria-orientation="horizontal"
        {...props}
      >
        <div className={`flex-grow border-t ${variantStyles[variant]} ${color}`} />
        <span className="flex-shrink mx-4 text-sm text-neutral-500">{label}</span>
        <div className={`flex-grow border-t ${variantStyles[variant]} ${color}`} />
      </div>
    );
  }

  return (
    <hr
      className={`border-t ${variantStyles[variant]} ${color} ${className}`.trim()}
      role="separator"
      aria-orientation="horizontal"
      {...props}
    />
  );
};

export default Divider;
