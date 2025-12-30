import { clsx } from 'clsx';

export interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
    const sizeStyles = {
        sm: 'text-[16px]',
        md: 'text-[24px]',
        lg: 'text-[32px]',
    };

    return (
        <span
            className={clsx(
                'material-symbols-outlined animate-spin text-primary',
                sizeStyles[size],
                className
            )}
        >
            progress_activity
        </span>
    );
}

export interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
}

export function Skeleton({
    className,
    variant = 'text',
    width,
    height,
}: SkeletonProps) {
    const variantStyles = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    };

    return (
        <div
            className={clsx(
                'bg-slate-200 dark:bg-slate-700 animate-pulse',
                variantStyles[variant],
                className
            )}
            style={{
                width: width,
                height: height,
            }}
        />
    );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} variant="text" className="flex-1 h-4" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-4 py-3">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton key={colIndex} variant="text" className="flex-1 h-4" />
                    ))}
                </div>
            ))}
        </div>
    );
}
