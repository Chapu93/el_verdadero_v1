import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout';
import { Button, Card, Input, EmptyState, Modal, Select, Skeleton, Pagination } from '@/components/ui';
import { toast } from '@/components/ui/Toast';
import { usePages, pagesApi, Page, CreatePageDto } from '../api/pages.api';
import { useTemplates, Template } from '@/features/templates/api/templates.api';
import { useCustomers, Customer } from '@/features/customers/api/customers.api';
import { clsx } from 'clsx';

export function PagesPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [customerFilter, setCustomerFilter] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Get pages with filters
    const { data: pagesData, isLoading } = usePages(page, 10, customerFilter || undefined, search);
    const pages = pagesData?.data ?? [];
    const meta = pagesData?.meta;

    // Get templates and customers for the create modal
    const { data: templatesData } = useTemplates(1, 100);
    const templates = templatesData?.data ?? [];

    const { data: customersData } = useCustomers(1, 100);
    const customers = customersData?.data ?? [];

    // Form state
    const [formData, setFormData] = useState<CreatePageDto>({
        templateId: '',
        customerId: '',
        name: '',
        slug: '',
    });

    const createMutation = useMutation({
        mutationFn: (data: CreatePageDto) => pagesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pages'] });
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            toast.success('Página creada', 'La página se creó correctamente.');
            setIsCreateModalOpen(false);
            resetForm();
        },
        onError: (error: Error) => {
            if (error.message.includes('SLUG_ALREADY_EXISTS')) {
                toast.error('Error', 'El slug ya existe. Elige otro diferente.');
            } else {
                toast.error('Error', 'No se pudo crear la página.');
            }
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => pagesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pages'] });
            toast.success('Página eliminada', 'La página se eliminó correctamente.');
        },
        onError: () => {
            toast.error('Error', 'No se pudo eliminar la página.');
        },
    });

    const publishMutation = useMutation({
        mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
            publish ? pagesApi.publish(id) : pagesApi.unpublish(id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['pages'] });
            toast.success(
                variables.publish ? 'Página publicada' : 'Página despublicada',
                variables.publish ? 'La página ya está visible públicamente.' : 'La página ya no es visible.'
            );
        },
    });

    const resetForm = () => {
        setFormData({
            templateId: '',
            customerId: '',
            name: '',
            slug: '',
        });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[áàäâ]/g, 'a')
            .replace(/[éèëê]/g, 'e')
            .replace(/[íìïî]/g, 'i')
            .replace(/[óòöô]/g, 'o')
            .replace(/[úùüû]/g, 'u')
            .replace(/ñ/g, 'n')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Páginas de Clientes
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Gestiona las páginas asignadas a cada cliente
                        </p>
                    </div>
                    <Button
                        leftIcon={<span className="material-symbols-outlined text-[18px]">add</span>}
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        Nueva Página
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 max-w-md">
                        <Input
                            placeholder="Buscar páginas..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            leftIcon={<span className="material-symbols-outlined text-[20px]">search</span>}
                        />
                    </div>
                    <Select
                        value={customerFilter}
                        onChange={(e) => {
                            setCustomerFilter(e.target.value);
                            setPage(1);
                        }}
                        className="w-48"
                    >
                        <option value="">Todos los clientes</option>
                        {customers.map((customer: Customer) => (
                            <option key={customer.id} value={customer.id}>
                                {customer.name}
                            </option>
                        ))}
                    </Select>
                </div>

                {/* Pages List */}
                {isLoading ? (
                    <Card padding="none">
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="p-4 flex items-center gap-4">
                                    <Skeleton className="size-12 rounded-lg" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-5 w-48" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                    <Skeleton className="h-8 w-24" />
                                </div>
                            ))}
                        </div>
                    </Card>
                ) : pages.length === 0 ? (
                    <EmptyState
                        icon="web"
                        title="No hay páginas"
                        description="Crea tu primera página desde una plantilla para comenzar."
                        action={{
                            label: 'Nueva Página',
                            onClick: () => setIsCreateModalOpen(true),
                        }}
                    />
                ) : (
                    <>
                        <Card padding="none">
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {pages.map((pageItem: Page) => (
                                    <div
                                        key={pageItem.id}
                                        className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                                    >
                                        {/* Icon */}
                                        <div className="size-12 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white">
                                            <span className="material-symbols-outlined">web</span>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-semibold text-slate-900 dark:text-white truncate">
                                                    {pageItem.name}
                                                </h3>
                                                <span
                                                    className={clsx(
                                                        'px-2 py-0.5 text-xs font-medium rounded-full',
                                                        pageItem.isPublished
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                                    )}
                                                >
                                                    {pageItem.isPublished ? 'Publicada' : 'Borrador'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[16px]">person</span>
                                                    {pageItem.customer?.name || 'Sin cliente'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[16px]">link</span>
                                                    /p/{pageItem.slug}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => navigate(`/pages/${pageItem.id}/edit`)}
                                            >
                                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                            </Button>
                                            {pageItem.isPublished ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => window.open(`http://localhost:4000/p/${pageItem.slug}`, '_blank')}
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                                                </Button>
                                            ) : null}
                                            <Button
                                                size="sm"
                                                variant={pageItem.isPublished ? 'outline' : 'primary'}
                                                onClick={() => publishMutation.mutate({ id: pageItem.id, publish: !pageItem.isPublished })}
                                            >
                                                <span className="material-symbols-outlined text-[16px]">
                                                    {pageItem.isPublished ? 'unpublished' : 'publish'}
                                                </span>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    if (confirm('¿Eliminar esta página?')) {
                                                        deleteMutation.mutate(pageItem.id);
                                                    }
                                                }}
                                            >
                                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {meta && meta.totalPages > 1 && (
                            <Pagination
                                currentPage={page}
                                totalPages={meta.totalPages}
                                onPageChange={setPage}
                                totalItems={meta.total}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Create Page Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                }}
                title="Nueva Página"
            >
                <form onSubmit={handleCreate} className="space-y-4">
                    <Select
                        label="Plantilla"
                        value={formData.templateId}
                        onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                        required
                    >
                        <option value="">Selecciona una plantilla</option>
                        {templates.map((template: Template) => (
                            <option key={template.id} value={template.id}>
                                {template.name}
                            </option>
                        ))}
                    </Select>

                    <Select
                        label="Cliente"
                        value={formData.customerId}
                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                        required
                    >
                        <option value="">Selecciona un cliente</option>
                        {customers.map((customer: Customer) => (
                            <option key={customer.id} value={customer.id}>
                                {customer.name} - {customer.email}
                            </option>
                        ))}
                    </Select>

                    <Input
                        label="Nombre de la página"
                        placeholder="Ej: Landing de Verano"
                        value={formData.name}
                        onChange={(e) => {
                            const name = e.target.value;
                            setFormData({
                                ...formData,
                                name,
                                slug: generateSlug(name),
                            });
                        }}
                        required
                    />

                    <Input
                        label="Slug (URL)"
                        placeholder="landing-de-verano"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        required
                    />
                    <p className="text-xs text-slate-500 -mt-2">
                        La página será visible en: /p/{formData.slug || 'slug'}
                    </p>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            isLoading={createMutation.isPending}
                            disabled={!formData.templateId || !formData.customerId}
                        >
                            Crear Página
                        </Button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
