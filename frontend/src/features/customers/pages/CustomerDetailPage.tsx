import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout';
import { Button, Card, EmptyState, Skeleton } from '@/components/ui';
import { customersApi } from '../api/customers.api';
import { ordersApi, Order } from '@/features/orders/api/orders.api';
import { EditCustomerModal } from '../components/EditCustomerModal';
import { DeleteCustomerDialog } from '../components/DeleteCustomerDialog';
import { clsx } from 'clsx';

export function CustomerDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { data: customerData, isLoading, isError } = useQuery({
        queryKey: ['customers', id],
        queryFn: () => customersApi.getById(id!),
        enabled: !!id,
    });

    const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
        queryKey: ['orders', 'customer', id],
        queryFn: () => ordersApi.getAll(1, 100, undefined), // Get all orders, then filter
        enabled: !!id,
    });

    const customer = customerData?.data;
    const customerOrders = ordersData?.data?.filter((order: Order) => order.customer.id === id) || [];

    const statusStyles = {
        ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        INACTIVE: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
        PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    };

    const statusLabels = {
        ACTIVE: 'Activo',
        INACTIVE: 'Inactivo',
        PENDING: 'Pendiente',
    };

    const orderStatusStyles = {
        PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };

    const orderStatusLabels = {
        PENDING: 'Pendiente',
        PROCESSING: 'Procesando',
        COMPLETED: 'Completado',
        CANCELLED: 'Cancelado',
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);

    const formatDate = (date: string) =>
        new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(new Date(date));

    const handleDeleteSuccess = () => {
        navigate('/customers');
    };

    if (isLoading) {
        return (
            <AppLayout>
                <div className="flex flex-col gap-6">
                    <Skeleton className="h-10 w-64" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-1">
                            <div className="flex flex-col items-center gap-4 p-6">
                                <Skeleton className="size-24 rounded-full" />
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                        </Card>
                        <Card className="lg:col-span-2">
                            <Skeleton className="h-64" />
                        </Card>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (isError || !customer) {
        return (
            <AppLayout>
                <EmptyState
                    icon="error"
                    title="Cliente no encontrado"
                    description="No se pudo encontrar el cliente solicitado."
                    action={{ label: 'Volver a Clientes', onClick: () => navigate('/customers') }}
                />
            </AppLayout>
        );
    }

    const totalOrders = customerOrders.length;
    const totalSpent = customerOrders.reduce((sum: number, order: Order) => sum + order.total, 0);

    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/customers')}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                Detalle del Cliente
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">
                                Información completa y pedidos asociados
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            leftIcon={<span className="material-symbols-outlined text-[18px]">edit</span>}
                            onClick={() => setIsEditModalOpen(true)}
                        >
                            Editar
                        </Button>
                        <Button
                            variant="danger"
                            leftIcon={<span className="material-symbols-outlined text-[18px]">delete</span>}
                            onClick={() => setIsDeleteDialogOpen(true)}
                        >
                            Eliminar
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Customer Info Card */}
                    <Card className="lg:col-span-1">
                        <div className="flex flex-col items-center gap-4 p-6">
                            <div
                                className="size-24 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white text-3xl font-bold"
                                style={
                                    customer.avatar
                                        ? { backgroundImage: `url(${customer.avatar})`, backgroundSize: 'cover' }
                                        : undefined
                                }
                            >
                                {!customer.avatar && customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-center">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {customer.name}
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400">{customer.email}</p>
                            </div>
                            <span
                                className={clsx(
                                    'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
                                    statusStyles[customer.status]
                                )}
                            >
                                {statusLabels[customer.status]}
                            </span>
                        </div>

                        {/* Stats */}
                        <div className="border-t border-slate-100 dark:border-slate-800 p-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-primary">{totalOrders}</p>
                                    <p className="text-sm text-slate-500">Pedidos</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalSpent)}</p>
                                    <p className="text-sm text-slate-500">Total Gastado</p>
                                </div>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="border-t border-slate-100 dark:border-slate-800 p-6 space-y-4">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider">Fecha de Registro</p>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {formatDate(customer.registrationDate)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider">ID del Cliente</p>
                                <p className="text-sm font-mono text-slate-600 dark:text-slate-400">
                                    {customer.id}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Orders List */}
                    <Card className="lg:col-span-2" padding="none">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Historial de Pedidos
                            </h3>
                            <p className="text-sm text-slate-500">
                                {totalOrders} pedido{totalOrders !== 1 ? 's' : ''} registrado{totalOrders !== 1 ? 's' : ''}
                            </p>
                        </div>

                        {isLoadingOrders ? (
                            <div className="p-6 space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-16" />
                                ))}
                            </div>
                        ) : customerOrders.length === 0 ? (
                            <EmptyState
                                icon="receipt_long"
                                title="Sin pedidos"
                                description="Este cliente aún no tiene pedidos registrados."
                            />
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {customerOrders.map((order: Order) => (
                                    <div
                                        key={order.id}
                                        className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/orders/${order.id}`)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary">receipt_long</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-primary">{order.orderNumber}</p>
                                                <p className="text-xs text-slate-500">{formatDate(order.orderDate)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span
                                                className={clsx(
                                                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                                    orderStatusStyles[order.status]
                                                )}
                                            >
                                                {orderStatusLabels[order.status]}
                                            </span>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                {formatCurrency(order.total)}
                                            </span>
                                            <span className="material-symbols-outlined text-slate-400 text-[18px]">
                                                chevron_right
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Edit Modal */}
            <EditCustomerModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                customer={customer}
            />

            {/* Delete Dialog */}
            <DeleteCustomerDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    handleDeleteSuccess();
                }}
                customer={customer}
            />
        </AppLayout>
    );
}
