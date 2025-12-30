import { ReactNode } from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    children?: ReactNode;
}

export function EmptyState({
    icon = 'inbox',
    title,
    description,
    action,
    children,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
                <span className="material-symbols-outlined text-3xl text-slate-400">
                    {icon}
                </span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                    {description}
                </p>
            )}
            {action && (
                <Button onClick={action.onClick} leftIcon={<span className="material-symbols-outlined text-[18px]">add</span>}>
                    {action.label}
                </Button>
            )}
            {children}
        </div>
    );
}
