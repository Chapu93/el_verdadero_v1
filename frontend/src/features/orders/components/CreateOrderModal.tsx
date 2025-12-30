import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Modal, Button, Input, Select } from '@/components/ui';
import { toast } from '@/components/ui/Toast';
import { ordersApi, CreateOrderDto } from '../api/orders.api';
import { customersApi } from '@/features/customers/api/customers.api';

interface CreateOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateOrderModal({ isOpen, onClose }: CreateOrderModalProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<CreateOrderDto>({
        customerId: '',
        total: 0,
        status: 'PENDING',
    });

    // Fetch customers for select
    const { data: customersData } = useQuery({
        queryKey: ['customers', 1, 100],
        queryFn: () => customersApi.getAll(1, 100),
        enabled: isOpen,
    });

    const customers = customersData?.data ?? [];

    const mutation = useMutation({
        mutationFn: (data: CreateOrderDto) => ordersApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            toast.success('Pedido creado', 'El pedido ha sido creado correctamente.');
            handleClose();
        },
        onError: () => {
            toast.error('Error', 'No se pudo crear el pedido. Verifica los datos.');
        },
    });

    const handleClose = () => {
        setFormData({ customerId: '', total: 0, status: 'PENDING' });
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Nuevo Pedido" size="md">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Select
                    label="Cliente"
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    options={[
                        { value: '', label: 'Seleccionar cliente...' },
                        ...customers.map((c) => ({ value: c.id, label: `${c.name} (${c.email})` })),
                    ]}
                    required
                />

                <Input
                    label="Total"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.total || ''}
                    onChange={(e) => setFormData({ ...formData, total: parseFloat(e.target.value) || 0 })}
                    leftIcon={<span className="text-slate-400 text-sm">$</span>}
                    required
                />

                <Select
                    label="Estado inicial"
                    value={formData.status || 'PENDING'}
                    onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value as CreateOrderDto['status'] })
                    }
                    options={[
                        { value: 'PENDING', label: 'Pendiente' },
                        { value: 'PROCESSING', label: 'Procesando' },
                        { value: 'COMPLETED', label: 'Completado' },
                    ]}
                />

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button type="button" variant="outline" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" isLoading={mutation.isPending}>
                        Crear Pedido
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
