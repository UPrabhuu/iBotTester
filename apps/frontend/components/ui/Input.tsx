import React, { forwardRef } from 'react';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'default' | 'filled';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Size of the input field
   */
  size?: InputSize;
  /**
   * Visual variant of the input
   */
  variant?: InputVariant;
  /**
   * Whether the input has an error state
   */
  error?: boolean;
  /**
   * Error message to display below the input
   */
  errorMessage?: string;
  /**
   * Label for the input field
   */
  label?: string;
  /**
   * Helper text to display below the input
   */
  helperText?: string;
  /**
   * Icon to display on the left side of the input
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon to display on the right side of the input
   */
  rightIcon?: React.ReactNode;
  /**
   * Whether the input should take full width
   */
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      variant = 'default',
      error = false,
      errorMessage,
      label,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = 'border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles: Record<InputVariant, string> = {
      default: 'bg-white border-neutral-300 focus:border-blue-500 focus:ring-blue-500/20',
      filled: 'bg-neutral-100 border-neutral-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20',
    };

    const sizeStyles: Record<InputSize, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-3 text-lg',
    };

    const errorStyles = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      : '';

    const widthStyles = fullWidth ? 'w-full' : '';

    const paddingWithIcon = leftIcon
      ? size === 'sm' ? 'pl-10' : size === 'lg' ? 'pl-14' : 'pl-12'
      : '';
    const paddingRightWithIcon = rightIcon
      ? size === 'sm' ? 'pr-10' : size === 'lg' ? 'pr-14' : 'pr-12'
      : '';

    const inputClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${errorStyles} ${widthStyles} ${paddingWithIcon} ${paddingRightWithIcon} ${className}`.trim();

    const iconSizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
    const iconPositionLeft = size === 'sm' ? 'left-3' : size === 'lg' ? 'left-4' : 'left-3';
    const iconPositionRight = size === 'sm' ? 'right-3' : size === 'lg' ? 'right-4' : 'right-3';

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className={`absolute ${iconPositionLeft} top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none ${iconSizeClass}`}>
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={inputClassName}
            {...props}
          />
          {rightIcon && (
            <div className={`absolute ${iconPositionRight} top-1/2 -translate-y-1/2 text-neutral-400 ${iconSizeClass}`}>
              {rightIcon}
            </div>
          )}
        </div>
        {errorMessage && error && (
          <p className="mt-1.5 text-sm text-red-600">{errorMessage}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-neutral-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
