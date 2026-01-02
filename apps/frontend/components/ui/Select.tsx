import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export type SelectSize = 'sm' | 'md' | 'lg';
export type SelectVariant = 'default' | 'filled';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'onChange'> {
  /**
   * Size of the select field
   */
  size?: SelectSize;
  /**
   * Visual variant of the select
   */
  variant?: SelectVariant;
  /**
   * Whether the select has an error state
   */
  error?: boolean;
  /**
   * Error message to display below the select
   */
  errorMessage?: string;
  /**
   * Label for the select field
   */
  label?: string;
  /**
   * Helper text to display below the select
   */
  helperText?: string;
  /**
   * Whether the select should take full width
   */
  fullWidth?: boolean;
  /**
   * Icon to display on the left side
   */
  leftIcon?: React.ReactNode;
  /**
   * Options for custom dropdown (optional - will use children if not provided)
   */
  options?: SelectOption[];
  /**
   * onChange handler
   */
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      size = 'md',
      variant = 'default',
      error = false,
      errorMessage,
      label,
      helperText,
      fullWidth = true,
      leftIcon,
      className = '',
      children,
      options,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value || '');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectRef = useRef<HTMLSelectElement>(null);

    // Update selected value when value prop changes
    useEffect(() => {
      setSelectedValue(value || '');
    }, [value]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    // Parse options from children if not provided via props
    const parsedOptions: SelectOption[] = options || [];
    if (!options && children) {
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && child.type === 'option') {
          const optionProps = child.props as any;
          parsedOptions.push({
            value: optionProps.value,
            label: optionProps.children,
            disabled: optionProps.disabled,
          });
        }
      });
    }

    const selectedOption = parsedOptions.find(opt => opt.value === selectedValue);
    const displayText = selectedOption?.label || 'Select...';

    const handleSelect = (optionValue: string) => {
      setSelectedValue(optionValue);
      setIsOpen(false);
      
      // Trigger native onChange event
      if (onChange && selectRef.current) {
        const nativeEvent = new Event('change', { bubbles: true });
        Object.defineProperty(nativeEvent, 'target', {
          writable: false,
          value: { ...selectRef.current, value: optionValue }
        });
        onChange(nativeEvent as any);
      }
    };

    const baseStyles = 'border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-gray-900 dark:text-gray-100';

    const variantStyles: Record<SelectVariant, string> = {
      default: 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:border-blue-500 focus:ring-blue-500/20 dark:focus:border-blue-400',
      filled: 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus:bg-white dark:focus:bg-gray-600 focus:border-blue-500 focus:ring-blue-500/20 dark:focus:border-blue-400',
    };

    const sizeStyles: Record<SelectSize, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-5 py-3 text-lg',
    };

    const errorStyles = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      : '';

    const widthStyles = fullWidth ? 'w-full' : '';

    const paddingWithIcon = leftIcon
      ? size === 'sm' ? 'pl-10' : size === 'lg' ? 'pl-14' : 'pl-12'
      : '';

    const paddingRight = size === 'sm' ? 'pr-10' : size === 'lg' ? 'pr-12' : 'pr-10';

    const buttonClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${errorStyles} ${widthStyles} ${paddingWithIcon} ${paddingRight} ${className} flex items-center justify-between`.trim();

    const iconSizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
    const iconPositionLeft = size === 'sm' ? 'left-3' : size === 'lg' ? 'left-4' : 'left-3';

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative" ref={dropdownRef}>
          {leftIcon && (
            <div className={`absolute ${iconPositionLeft} top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none z-10`}>
              {leftIcon}
            </div>
          )}
          
          {/* Custom dropdown button */}
          <button
            type="button"
            onClick={() => !props.disabled && setIsOpen(!isOpen)}
            className={buttonClassName}
            disabled={props.disabled}
          >
            <span className={!selectedOption ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}>
              {displayText}
            </span>
            <ChevronDown 
              className={`${iconSizeClass} text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {/* Hidden native select for form compatibility */}
          <select
            ref={(node) => {
              selectRef.current = node;
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            value={selectedValue}
            onChange={onChange}
            className="sr-only"
            tabIndex={-1}
            {...props}
          >
            {children}
          </select>

          {/* Custom dropdown menu */}
          {isOpen && (
            <div className={`absolute z-50 w-full mt-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200`}>
              <div className="max-h-64 overflow-y-auto py-1">
                {parsedOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => !option.disabled && handleSelect(option.value)}
                    disabled={option.disabled}
                    className={`
                      w-full px-4 py-2.5 text-left flex items-center justify-between transition-colors duration-150
                      ${option.value === selectedValue 
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }
                      ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}
                    `}
                  >
                    <span>{option.label}</span>
                    {option.value === selectedValue && (
                      <Check className={`${iconSizeClass} text-blue-600 dark:text-blue-400`} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {(helperText || errorMessage) && (
          <p className={`mt-1.5 text-sm ${error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {error ? errorMessage : helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
