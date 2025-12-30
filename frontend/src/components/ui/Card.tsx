import { ReactNode } from 'react';
import { clsx } from 'clsx';

export interface CardProps {
    children: ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
}

export function Card({ children, className, padding = 'md', hover = false }: CardProps) {
    const paddingStyles = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div
            className={clsx(
                'bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm',
                paddingStyles[padding],
                hover && 'transition-all duration-300 hover:-translate-y-1 hover:shadow-md',
                className
            )}
        >
            {children}
        </div>
    );
}

export interface CardHeaderProps {
    title: string;
    description?: string;
    action?: ReactNode;
}

export function CardHeader({ title, description, action }: CardHeaderProps) {
    return (
        <div className="flex items-start justify-between mb-4">
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                {description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
                )}
            </div>
            {action}
        </div>
    );
}
