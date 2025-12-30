import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Input, Select } from '@/components/ui';
import { toast } from '@/components/ui/Toast';
import { customersApi, Customer, CreateCustomerDto } from '../api/customers.api';

interface EditCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer | null;
}

export function EditCustomerModal({ isOpen, onClose, customer }: EditCustomerModalProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<CreateCustomerDto>({
        name: '',
        email: '',
        avatar: '',
        status: 'PENDING',
    });

    useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name,
                email: customer.email,
                avatar: customer.avatar || '',
                status: customer.status,
            });
        }
    }, [customer]);

    const mutation = useMutation({
        mutationFn: (data: CreateCustomerDto) =>
            customersApi.update(customer!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            toast.success('Cliente actualizado', 'Los datos del cliente han sido actualizados.');
            onClose();
        },
        onError: () => {
            toast.error('Error', 'No se pudo actualizar el cliente.');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSend = {
            ...formData,
            avatar: formData.avatar || undefined,
        };
        mutation.mutate(dataToSend);
    };

    if (!customer) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Editar Cliente" size="md">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                    label="Nombre completo"
                    placeholder="Ej: Juan Pérez"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />

                <Input
                    label="Email"
                    type="email"
                    placeholder="email@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                />

                <Input
                    label="URL de Avatar (opcional)"
                    type="url"
                    placeholder="https://..."
                    value={formData.avatar || ''}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                />

                <Select
                    label="Estado"
                    value={formData.status || 'PENDING'}
                    onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value as CreateCustomerDto['status'] })
                    }
                    options={[
                        { value: 'PENDING', label: 'Pendiente' },
                        { value: 'ACTIVE', label: 'Activo' },
                        { value: 'INACTIVE', label: 'Inactivo' },
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
