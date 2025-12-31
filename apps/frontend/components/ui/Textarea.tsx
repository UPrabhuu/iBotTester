import React, { forwardRef } from 'react';

export type TextareaSize = 'sm' | 'md' | 'lg';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Size of the textarea field
   */
  size?: TextareaSize;
  /**
   * Whether the textarea has an error state
   */
  error?: boolean;
  /**
   * Error message to display below the textarea
   */
  errorMessage?: string;
  /**
   * Label for the textarea field
   */
  label?: string;
  /**
   * Helper text to display below the textarea
   */
  helperText?: string;
  /**
   * Whether the textarea should take full width
   */
  fullWidth?: boolean;
  /**
   * Whether to allow resizing the textarea
   */
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      size = 'md',
      error = false,
      errorMessage,
      label,
      helperText,
      fullWidth = true,
      resize = 'vertical',
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = 'border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed bg-white border-neutral-300 focus:border-blue-500 focus:ring-blue-500/20';

    const sizeStyles: Record<TextareaSize, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-3 text-lg',
    };

    const errorStyles = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      : '';

    const widthStyles = fullWidth ? 'w-full' : '';

    const resizeStyles: Record<typeof resize, string> = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    const textareaClassName = `${baseStyles} ${sizeStyles[size]} ${errorStyles} ${widthStyles} ${resizeStyles[resize]} ${className}`.trim();

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={textareaClassName}
          {...props}
        />
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

Textarea.displayName = 'Textarea';

export default Textarea;
