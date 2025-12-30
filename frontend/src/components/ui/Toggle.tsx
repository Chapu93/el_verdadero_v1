import { forwardRef, InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    description?: string;
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
    ({ className, label, description, id, ...props }, ref) => {
        const toggleId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="flex items-center justify-between">
                {(label || description) && (
                    <div className="flex flex-col">
                        {label && (
                            <label
                                htmlFor={toggleId}
                                className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer"
                            >
                                {label}
                            </label>
                        )}
                        {description && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                {description}
                            </span>
                        )}
                    </div>
                )}
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        ref={ref}
                        id={toggleId}
                        type="checkbox"
                        className={clsx('sr-only peer', className)}
                        {...props}
                    />
                    <div
                        className={clsx(
                            'w-11 h-6 bg-slate-200 rounded-full peer',
                            'dark:bg-slate-700',
                            'peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20',
                            'peer-checked:after:translate-x-full peer-checked:after:border-white',
                            "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
                            'after:bg-white after:border-slate-300 after:border after:rounded-full',
                            'after:h-5 after:w-5 after:transition-all',
                            'peer-checked:bg-primary'
                        )}
                    />
                </label>
            </div>
        );
    }
);

Toggle.displayName = 'Toggle';
