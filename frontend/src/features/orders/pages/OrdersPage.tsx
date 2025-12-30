import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Button, Card, Pagination, EmptyState, TableSkeleton } from '@/components/ui';
import { useOrders, Order } from '../api/orders.api';
import { CreateOrderModal } from '../components/CreateOrderModal';
import { EditOrderModal } from '../components/EditOrderModal';
import { DeleteOrderDialog } from '../components/DeleteOrderDialog';
import { clsx } from 'clsx';

export function OrdersPage() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
    const { data, isLoading, isError } = useOrders(page, 10, statusFilter);

    const orders = data?.data ?? [];
    const meta = data?.meta;

    const statusStyles = {
        PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };

    const statusLabels = {
        PENDING: 'Pendiente',
        PROCESSING: 'Procesando',
        COMPLETED: 'Completado',
        CANCELLED: 'Cancelado',
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);

    const formatDate = (date: string) =>
        new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(new Date(date));

    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Listado de Pedidos
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Gestiona y da seguimiento a todos tus pedidos
                        </p>
                    </div>
                    <Button
                        leftIcon={<span className="material-symbols-outlined text-[18px]">add</span>}
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        Nuevo Pedido
                    </Button>
                </div>

                {/* Status Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {['Todos', 'PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status === 'Todos' ? undefined : status)}
                            className={clsx(
                                'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                                (status === 'Todos' && !statusFilter) || status === statusFilter
                                    ? 'bg-primary text-white'
                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary/30'
                            )}
                        >
                            {status === 'Todos' ? 'Todos' : statusLabels[status as keyof typeof statusLabels]}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <Card padding="none">
                    {isLoading ? (
                        <div className="p-6">
                            <TableSkeleton rows={5} columns={5} />
                        </div>
                    ) : isError ? (
                        <EmptyState
                            icon="error"
                            title="Error al cargar pedidos"
                            description="No se pudieron cargar los pedidos. Intenta de nuevo."
                            action={{ label: 'Reintentar', onClick: () => window.location.reload() }}
                        />
                    ) : orders.length === 0 ? (
                        <EmptyState
                            icon="receipt_long"
                            title="Sin pedidos"
                            description="Aún no tienes pedidos. Crea el primero para comenzar."
                            action={{ label: 'Crear Pedido', onClick: () => setIsCreateModalOpen(true) }}
                        />
                    ) : (
                        <>
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                <div className="col-span-2">Pedido</div>
                                <div className="col-span-3">Cliente</div>
                                <div className="col-span-2">Fecha</div>
                                <div className="col-span-2">Estado</div>
                                <div className="col-span-2">Total</div>
                                <div className="col-span-1 text-right">Acciones</div>
                            </div>

                            {/* Table Rows */}
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {orders.map((order: Order) => (
                                    <div
                                        key={order.id}
                                        className="grid grid-cols-12 items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                                    >
                                        <div className="col-span-2 text-sm font-medium text-primary">
                                            {order.orderNumber}
                                        </div>
                                        <div className="col-span-3 flex items-center gap-3">
                                            <div
                                                className="size-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex-shrink-0"
                                                style={
                                                    order.customer.avatar
                                                        ? { backgroundImage: `url(${order.customer.avatar})`, backgroundSize: 'cover' }
                                                        : undefined
                                                }
                                            />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                                    {order.customer.name}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate">
                                                    {order.customer.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="col-span-2 text-sm text-slate-500 dark:text-slate-400">
                                            {formatDate(order.orderDate)}
                                        </div>
                                        <div className="col-span-2">
                                            <span
                                                className={clsx(
                                                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                                    statusStyles[order.status]
                                                )}
                                            >
                                                {statusLabels[order.status]}
                                            </span>
                                        </div>
                                        <div className="col-span-2 text-sm font-semibold text-slate-900 dark:text-white">
                                            {formatCurrency(order.total)}
                                        </div>
                                        <div className="col-span-1 flex justify-end gap-1">
                                            <button
                                                onClick={() => setEditingOrder(order)}
                                                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                title="Editar pedido"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                            <button
                                                onClick={() => setDeletingOrder(order)}
                                                className="p-2 text-slate-400 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                                                title="Eliminar pedido"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {meta && (
                                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800">
                                    <Pagination
                                        currentPage={meta.page}
                                        totalPages={meta.totalPages}
                                        onPageChange={setPage}
                                        showInfo
                                        totalItems={meta.total}
                                        itemsPerPage={meta.limit}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </Card>
            </div>

            {/* Create Order Modal */}
            <CreateOrderModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            {/* Edit Order Modal */}
            <EditOrderModal
                isOpen={!!editingOrder}
                onClose={() => setEditingOrder(null)}
                order={editingOrder}
            />

            {/* Delete Order Dialog */}
            <DeleteOrderDialog
                isOpen={!!deletingOrder}
                onClose={() => setDeletingOrder(null)}
                order={deletingOrder}
            />
        </AppLayout>
    );
}
