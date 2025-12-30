import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, leftIcon, rightIcon, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="flex flex-col gap-2">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                        {label}
                    </label>
                )}
                <div className="relative group">
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={clsx(
                            'w-full h-12 px-4 rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-white',
                            'placeholder:text-slate-400 dark:placeholder:text-slate-500',
                            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all',
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            error
                                ? 'border-error focus:ring-error/20 focus:border-error'
                                : 'border-slate-200 dark:border-slate-700',
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && <p className="text-sm text-error">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
