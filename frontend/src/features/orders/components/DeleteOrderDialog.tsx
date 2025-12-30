import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ConfirmDialog } from '@/components/ui';
import { toast } from '@/components/ui/Toast';
import { ordersApi, Order } from '../api/orders.api';

interface DeleteOrderDialogProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
}

export function DeleteOrderDialog({ isOpen, onClose, order }: DeleteOrderDialogProps) {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => ordersApi.delete(order!.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            toast.success('Pedido eliminado', 'El pedido ha sido eliminado correctamente.');
            onClose();
        },
        onError: () => {
            toast.error('Error', 'No se pudo eliminar el pedido.');
        },
    });

    if (!order) return null;

    return (
        <ConfirmDialog
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={() => mutation.mutate()}
            title="Eliminar Pedido"
            message={`¿Estás seguro de que deseas eliminar el pedido "${order.orderNumber}"? Esta acción no se puede deshacer.`}
            variant="danger"
            confirmText="Eliminar"
            isLoading={mutation.isPending}
        />
    );
}
