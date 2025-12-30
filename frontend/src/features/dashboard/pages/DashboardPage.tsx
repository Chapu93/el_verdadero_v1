import { AppLayout } from '@/components/layout';
import { Card, Skeleton } from '@/components/ui';
import { useDashboardStats } from '../api/stats.api';
import { clsx } from 'clsx';

export function DashboardPage() {
    const { data, isLoading } = useDashboardStats();
    const stats = data?.data;

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);

    const statCards = [
        {
            label: 'Total Pedidos',
            value: stats?.totalOrders ?? 0,
            icon: 'receipt_long',
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        },
        {
            label: 'Pedidos Pendientes',
            value: stats?.pendingOrders ?? 0,
            icon: 'pending',
            color: 'bg-amber-500',
            bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        },
        {
            label: 'Completados',
            value: stats?.completedOrders ?? 0,
            icon: 'check_circle',
            color: 'bg-green-500',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
        },
        {
            label: 'Total Ingresos',
            value: formatCurrency(stats?.totalRevenue ?? 0),
            icon: 'payments',
            color: 'bg-primary',
            bgColor: 'bg-primary/10',
            isLarge: true,
        },
    ];

    return (
        <AppLayout>
            <div className="flex flex-col gap-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Dashboard
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Resumen de tu actividad
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat) => (
                        <Card key={stat.label} padding="md" hover>
                            <div className="flex items-start justify-between">
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                        {stat.label}
                                    </span>
                                    {isLoading ? (
                                        <Skeleton variant="text" className="h-8 w-24" />
                                    ) : (
                                        <span
                                            className={clsx(
                                                'font-bold text-slate-900 dark:text-white',
                                                stat.isLarge ? 'text-2xl' : 'text-3xl'
                                            )}
                                        >
                                            {stat.value}
                                        </span>
                                    )}
                                </div>
                                <div
                                    className={clsx(
                                        'flex items-center justify-center size-12 rounded-xl',
                                        stat.bgColor
                                    )}
                                >
                                    <span
                                        className={clsx(
                                            'material-symbols-outlined text-2xl',
                                            stat.color.replace('bg-', 'text-')
                                        )}
                                    >
                                        {stat.icon}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card padding="lg">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center justify-center size-10 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                                <span className="material-symbols-outlined text-purple-500">group</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Clientes</h3>
                                <p className="text-sm text-slate-500">Resumen de tu base de clientes</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div>
                                <p className="text-sm text-slate-500">Total Clientes</p>
                                {isLoading ? (
                                    <Skeleton variant="text" className="h-6 w-16 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {stats?.totalCustomers ?? 0}
                                    </p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Activos</p>
                                {isLoading ? (
                                    <Skeleton variant="text" className="h-6 w-16 mt-1" />
                                ) : (
                                    <p className="text-2xl font-bold text-green-500">
                                        {stats?.activeCustomers ?? 0}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card padding="lg">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center justify-center size-10 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                <span className="material-symbols-outlined text-blue-500">trending_up</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Estado de Pedidos</h3>
                                <p className="text-sm text-slate-500">Distribución actual</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="text-center">
                                <p className="text-sm text-slate-500">Procesando</p>
                                {isLoading ? (
                                    <Skeleton variant="text" className="h-6 w-12 mt-1 mx-auto" />
                                ) : (
                                    <p className="text-xl font-bold text-blue-500">{stats?.processingOrders ?? 0}</p>
                                )}
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-slate-500">Cancelados</p>
                                {isLoading ? (
                                    <Skeleton variant="text" className="h-6 w-12 mt-1 mx-auto" />
                                ) : (
                                    <p className="text-xl font-bold text-red-500">{stats?.cancelledOrders ?? 0}</p>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
