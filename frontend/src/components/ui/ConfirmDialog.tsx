import { Modal } from './Modal';
import { Button } from './Button';

export interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger',
    isLoading,
}: ConfirmDialogProps) {
    const iconMap = {
        danger: { icon: 'warning', bgColor: 'bg-red-50 dark:bg-red-900/20', iconColor: 'text-error' },
        warning: { icon: 'warning', bgColor: 'bg-amber-50 dark:bg-amber-900/20', iconColor: 'text-warning' },
        info: { icon: 'info', bgColor: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-info' },
    };

    const config = iconMap[variant];

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div
                    className={`mx-auto flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full ${config.bgColor} mb-6`}
                >
                    <span className={`material-symbols-outlined text-3xl ${config.iconColor}`}>
                        {config.icon}
                    </span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-300 leading-relaxed px-4">
                    {message}
                </p>

                {/* Actions */}
                <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-center gap-3 w-full">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === 'danger' ? 'danger' : 'primary'}
                        onClick={onConfirm}
                        isLoading={isLoading}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
