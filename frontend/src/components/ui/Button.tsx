import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'primary',
            size = 'md',
            isLoading,
            leftIcon,
            rightIcon,
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        const baseStyles = clsx(
            'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed'
        );

        const variantStyles = {
            primary: 'bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/20',
            secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700',
            outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-transparent dark:text-slate-200 dark:hover:bg-slate-800',
            ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
            danger: 'bg-error text-white hover:bg-red-600 shadow-md shadow-error/20',
        };

        const sizeStyles = {
            sm: 'h-8 px-3 text-xs',
            md: 'h-10 px-4 text-sm',
            lg: 'h-12 px-6 text-base',
        };

        return (
            <button
                ref={ref}
                className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                ) : (
                    leftIcon
                )}
                {children}
                {rightIcon}
            </button>
        );
    }
);

Button.displayName = 'Button';
