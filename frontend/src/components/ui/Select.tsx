import { SelectHTMLAttributes, forwardRef, ReactNode } from 'react';
import { clsx } from 'clsx';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options?: Array<{ value: string; label: string }>;
    children?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, options, children, id, ...props }, ref) => {
        const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="flex flex-col gap-2">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        className={clsx(
                            'w-full h-12 px-4 pr-10 rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-white',
                            'appearance-none cursor-pointer',
                            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all',
                            error
                                ? 'border-error focus:ring-error/20 focus:border-error'
                                : 'border-slate-200 dark:border-slate-700',
                            className
                        )}
                        {...props}
                    >
                        {options
                            ? options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))
                            : children}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                        <span className="material-symbols-outlined">expand_more</span>
                    </div>
                </div>
                {error && <p className="text-sm text-error">{error}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';
