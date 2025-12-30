import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ConfirmDialog } from '@/components/ui';
import { toast } from '@/components/ui/Toast';
import { customersApi, Customer } from '../api/customers.api';

interface DeleteCustomerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer | null;
}

export function DeleteCustomerDialog({ isOpen, onClose, customer }: DeleteCustomerDialogProps) {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => customersApi.delete(customer!.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            toast.success('Cliente eliminado', 'El cliente ha sido eliminado correctamente.');
            onClose();
        },
        onError: () => {
            toast.error('Error', 'No se pudo eliminar el cliente. Puede que tenga pedidos asociados.');
        },
    });

    if (!customer) return null;

    return (
        <ConfirmDialog
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={() => mutation.mutate()}
            title="Eliminar Cliente"
            message={`¿Estás seguro de que deseas eliminar a "${customer.name}"? Esta acción no se puede deshacer.`}
            variant="danger"
            confirmText="Eliminar"
            isLoading={mutation.isPending}
        />
    );
}
