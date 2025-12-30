import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import { Button, Card, Input, Pagination, EmptyState, TableSkeleton } from '@/components/ui';
import { useCustomers, Customer } from '../api/customers.api';
import { CreateCustomerModal } from '../components/CreateCustomerModal';
import { EditCustomerModal } from '../components/EditCustomerModal';
import { DeleteCustomerDialog } from '../components/DeleteCustomerDialog';
import { clsx } from 'clsx';

export function CustomersPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
    const { data, isLoading, isError } = useCustomers(page, 10, search);
    const navigate = useNavigate();

    const customers = data?.data ?? [];
    const meta = data?.meta;

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

    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Gestión de Clientes
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Administra tu base de clientes de forma eficiente
                        </p>
                    </div>
                    <Button
                        leftIcon={<span className="material-symbols-outlined text-[18px]">add</span>}
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        Nuevo Cliente
                    </Button>
                </div>

                {/* Search and Filters */}
                <Card padding="md">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Buscar por nombre o email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                leftIcon={<span className="material-symbols-outlined text-[20px]">search</span>}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="md">
                                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                                Filtros
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Table */}
                <Card padding="none">
                    {isLoading ? (
                        <div className="p-6">
                            <TableSkeleton rows={5} columns={5} />
                        </div>
                    ) : isError ? (
                        <EmptyState
                            icon="error"
                            title="Error al cargar clientes"
                            description="No se pudieron cargar los clientes. Intenta de nuevo."
                            action={{ label: 'Reintentar', onClick: () => window.location.reload() }}
                        />
                    ) : customers.length === 0 ? (
                        <EmptyState
                            icon="group"
                            title="Sin clientes"
                            description="Aún no tienes clientes registrados. Comienza agregando el primero."
                            action={{ label: 'Agregar Cliente', onClick: () => setIsCreateModalOpen(true) }}
                        />
                    ) : (
                        <>
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                <div className="col-span-4">Cliente</div>
                                <div className="col-span-3">Email</div>
                                <div className="col-span-2">Estado</div>
                                <div className="col-span-2">Pedidos</div>
                                <div className="col-span-1 text-right">Acciones</div>
                            </div>

                            {/* Table Rows */}
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {customers.map((customer: Customer) => (
                                    <div
                                        key={customer.id}
                                        className="grid grid-cols-12 items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                                    >
                                        <div className="col-span-4 flex items-center gap-3">
                                            <div
                                                className="size-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex-shrink-0"
                                                style={
                                                    customer.avatar
                                                        ? { backgroundImage: `url(${customer.avatar})`, backgroundSize: 'cover' }
                                                        : undefined
                                                }
                                            />
                                            <button
                                                onClick={() => navigate(`/customers/${customer.id}`)}
                                                className="text-sm font-medium text-slate-900 dark:text-white truncate hover:text-primary transition-colors text-left"
                                            >
                                                {customer.name}
                                            </button>
                                        </div>
                                        <div className="col-span-3 text-sm text-slate-500 dark:text-slate-400 truncate">
                                            {customer.email}
                                        </div>
                                        <div className="col-span-2">
                                            <span
                                                className={clsx(
                                                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                                    statusStyles[customer.status]
                                                )}
                                            >
                                                {statusLabels[customer.status]}
                                            </span>
                                        </div>
                                        <div className="col-span-2 text-sm text-slate-600 dark:text-slate-300">
                                            {customer._count?.orders ?? 0}
                                        </div>
                                        <div className="col-span-1 flex justify-end gap-1">
                                            <button
                                                onClick={() => setEditingCustomer(customer)}
                                                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                title="Editar cliente"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                            <button
                                                onClick={() => setDeletingCustomer(customer)}
                                                className="p-2 text-slate-400 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                                                title="Eliminar cliente"
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

            {/* Create Customer Modal */}
            <CreateCustomerModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            {/* Edit Customer Modal */}
            <EditCustomerModal
                isOpen={!!editingCustomer}
                onClose={() => setEditingCustomer(null)}
                customer={editingCustomer}
            />

            {/* Delete Customer Dialog */}
            <DeleteCustomerDialog
                isOpen={!!deletingCustomer}
                onClose={() => setDeletingCustomer(null)}
                customer={deletingCustomer}
            />
        </AppLayout>
    );
}
