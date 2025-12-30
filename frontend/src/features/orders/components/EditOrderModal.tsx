import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Select } from '@/components/ui';
import { toast } from '@/components/ui/Toast';
import { ordersApi, Order, CreateOrderDto } from '../api/orders.api';

interface EditOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
}

export function EditOrderModal({ isOpen, onClose, order }: EditOrderModalProps) {
    const queryClient = useQueryClient();
    const [status, setStatus] = useState<CreateOrderDto['status']>('PENDING');

    useEffect(() => {
        if (order) {
            setStatus(order.status);
        }
    }, [order]);

    const mutation = useMutation({
        mutationFn: (newStatus: CreateOrderDto['status']) =>
            ordersApi.update(order!.id, { status: newStatus }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            toast.success('Pedido actualizado', 'El estado del pedido ha sido actualizado.');
            onClose();
        },
        onError: () => {
            toast.error('Error', 'No se pudo actualizar el pedido.');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(status);
    };

    if (!order) return null;

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Editar Pedido" size="md">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Order Info (read-only) */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Número de Pedido</span>
                        <span className="text-sm font-medium text-primary">{order.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Cliente</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {order.customer.name}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Total</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {formatCurrency(order.total)}
                        </span>
                    </div>
                </div>

                <Select
                    label="Estado del Pedido"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as CreateOrderDto['status'])}
                    options={[
                        { value: 'PENDING', label: 'Pendiente' },
                        { value: 'PROCESSING', label: 'Procesando' },
                        { value: 'COMPLETED', label: 'Completado' },
                        { value: 'CANCELLED', label: 'Cancelado' },
                    ]}
                />

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" isLoading={mutation.isPending}>
                        Guardar Cambios
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
