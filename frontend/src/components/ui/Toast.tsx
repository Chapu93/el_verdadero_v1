import { create } from 'zustand';
import { clsx } from 'clsx';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastStore {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (toast) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({
            toasts: [...state.toasts, { ...toast, id }],
        }));

        // Auto remove after duration
        const duration = toast.duration ?? 5000;
        setTimeout(() => {
            set((state) => ({
                toasts: state.toasts.filter((t) => t.id !== id),
            }));
        }, duration);
    },
    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        })),
}));

// Toast helper functions
export const toast = {
    success: (title: string, message?: string) =>
        useToastStore.getState().addToast({ type: 'success', title, message }),
    error: (title: string, message?: string) =>
        useToastStore.getState().addToast({ type: 'error', title, message }),
    warning: (title: string, message?: string) =>
        useToastStore.getState().addToast({ type: 'warning', title, message }),
    info: (title: string, message?: string) =>
        useToastStore.getState().addToast({ type: 'info', title, message }),
};

// Toast Container Component
export function ToastContainer() {
    const { toasts, removeToast } = useToastStore();

    const typeStyles = {
        success: {
            border: 'border-l-success',
            icon: 'check_circle',
            iconColor: 'text-success',
        },
        error: {
            border: 'border-l-error',
            icon: 'error',
            iconColor: 'text-error',
        },
        warning: {
            border: 'border-l-warning',
            icon: 'warning',
            iconColor: 'text-warning',
        },
        info: {
            border: 'border-l-info',
            icon: 'info',
            iconColor: 'text-info',
        },
    };

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-full max-w-sm">
            {toasts.map((t) => {
                const style = typeStyles[t.type];
                return (
                    <div
                        key={t.id}
                        className={clsx(
                            'relative w-full overflow-hidden rounded-lg bg-white dark:bg-surface-dark',
                            'border-l-4 shadow-lg p-4 flex gap-3',
                            'animate-in slide-in-from-right duration-300',
                            style.border
                        )}
                    >
                        <div className={clsx('shrink-0 pt-0.5', style.iconColor)}>
                            <span className="material-symbols-outlined">{style.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight mb-1">
                                {t.title}
                            </h4>
                            {t.message && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                                    {t.message}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => removeToast(t.id)}
                            className="shrink-0 self-start text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
