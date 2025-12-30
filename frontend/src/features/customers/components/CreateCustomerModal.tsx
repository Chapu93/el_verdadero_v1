import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Input, Select } from '@/components/ui';
import { toast } from '@/components/ui/Toast';
import { customersApi, CreateCustomerDto } from '../api/customers.api';

interface CreateCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateCustomerModal({ isOpen, onClose }: CreateCustomerModalProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<CreateCustomerDto>({
        name: '',
        email: '',
        avatar: '',
        status: 'PENDING',
    });

    const mutation = useMutation({
        mutationFn: (data: CreateCustomerDto) => customersApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            toast.success('Cliente creado', 'El cliente ha sido creado correctamente.');
            handleClose();
        },
        onError: () => {
            toast.error('Error', 'No se pudo crear el cliente. Verifica los datos.');
        },
    });

    const handleClose = () => {
        setFormData({ name: '', email: '', avatar: '', status: 'PENDING' });
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Don't send avatar if empty
        const dataToSend = {
            ...formData,
            avatar: formData.avatar || undefined,
        };
        mutation.mutate(dataToSend);
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Nuevo Cliente" size="md">
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
                    label="Estado inicial"
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
                    <Button type="button" variant="outline" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" isLoading={mutation.isPending}>
                        Crear Cliente
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
