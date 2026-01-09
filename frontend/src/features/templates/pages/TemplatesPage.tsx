import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout';
import { Button, Card, Input, EmptyState, Modal, Skeleton } from '@/components/ui';
import { toast } from '@/components/ui/Toast';
import { useTemplates, templatesApi, Template, CreateTemplateDto } from '../api/templates.api';
import { clsx } from 'clsx';

export function TemplatesPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [isCreatePageModalOpen, setIsCreatePageModalOpen] = useState(false);

    const { data, isLoading } = useTemplates(page, 12, search);
    const templates = data?.data ?? [];

    // Create template form state
    const [formData, setFormData] = useState<CreateTemplateDto>({
        name: '',
        description: '',
        thumbnail: '',
        htmlContent: '<div>{{title}}</div>',
        cssContent: '',
        isActive: true,
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateTemplateDto) => templatesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            toast.success('Plantilla creada', 'La plantilla se creó correctamente.');
            setIsCreateModalOpen(false);
            resetForm();
        },
        onError: () => {
            toast.error('Error', 'No se pudo crear la plantilla.');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => templatesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            toast.success('Plantilla eliminada', 'La plantilla se eliminó correctamente.');
        },
        onError: () => {
            toast.error('Error', 'No se pudo eliminar la plantilla.');
        },
    });

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            thumbnail: '',
            htmlContent: '<div>{{title}}</div>',
            cssContent: '',
            isActive: true,
        });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({
            ...formData,
            thumbnail: formData.thumbnail || undefined,
        });
    };

    const getTemplateGradient = (index: number) => {
        const gradients = [
            'from-blue-500 to-indigo-600',
            'from-purple-500 to-pink-600',
            'from-green-500 to-emerald-600',
            'from-orange-500 to-amber-600',
            'from-pink-500 to-rose-600',
            'from-cyan-500 to-blue-600',
        ];
        return gradients[index % gradients.length];
    };

    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Biblioteca de Plantillas
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Gestiona y crea plantillas para tus clientes
                        </p>
                    </div>
                    <Button
                        leftIcon={<span className="material-symbols-outlined text-[18px]">add</span>}
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        Nueva Plantilla
                    </Button>
                </div>

                {/* Search */}
                <div className="flex-1 max-w-md">
                    <Input
                        placeholder="Buscar plantillas..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        leftIcon={<span className="material-symbols-outlined text-[20px]">search</span>}
                    />
                </div>

                {/* Templates Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i} padding="none" className="overflow-hidden">
                                <Skeleton className="h-36" />
                                <div className="p-5 space-y-3">
                                    <Skeleton className="h-6 w-2/3" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : templates.length === 0 ? (
                    <EmptyState
                        icon="description"
                        title="No hay plantillas"
                        description="Crea tu primera plantilla para comenzar a generar páginas para tus clientes."
                        action={{
                            label: 'Crear Plantilla',
                            onClick: () => setIsCreateModalOpen(true),
                        }}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map((template, index) => (
                            <Card key={template.id} padding="none" hover className="overflow-hidden group">
                                {/* Preview Area */}
                                <div
                                    className={clsx(
                                        'h-36 bg-gradient-to-br flex items-center justify-center relative',
                                        getTemplateGradient(index)
                                    )}
                                >
                                    {template.thumbnail ? (
                                        <img
                                            src={template.thumbnail}
                                            alt={template.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="material-symbols-outlined text-5xl text-white/80 group-hover:scale-110 transition-transform">
                                            web
                                        </span>
                                    )}
                                    {!template.isActive && (
                                        <span className="absolute top-2 right-2 px-2 py-1 bg-slate-900/70 text-white text-xs rounded">
                                            Inactiva
                                        </span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                            {template.name}
                                        </h3>
                                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
                                            {template._count?.pages || 0} páginas
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                                        {template.description || 'Sin descripción'}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => {
                                                setSelectedTemplate(template);
                                                setIsCreatePageModalOpen(true);
                                            }}
                                        >
                                            <span className="material-symbols-outlined text-[16px] mr-1">content_copy</span>
                                            Usar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => navigate(`/templates/${template.id}/edit`)}
                                        >
                                            <span className="material-symbols-outlined text-[16px]">edit</span>
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                if (confirm('¿Eliminar esta plantilla?')) {
                                                    deleteMutation.mutate(template.id);
                                                }
                                            }}
                                        >
                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Template Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Nueva Plantilla"
                size="lg"
            >
                <form onSubmit={handleCreate} className="space-y-4">
                    <Input
                        label="Nombre"
                        placeholder="Ej: Landing Page Pro"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Descripción"
                        placeholder="Describe la plantilla..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                    <Input
                        label="Thumbnail URL"
                        placeholder="https://..."
                        value={formData.thumbnail}
                        onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    />
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 block">
                            Contenido HTML
                        </label>
                        <textarea
                            className="w-full h-40 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none font-mono text-sm"
                            placeholder="<div>{{title}}</div>"
                            value={formData.htmlContent}
                            onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                            required
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Usa {'{{variable}}'} para elementos editables
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 block">
                            CSS Personalizado
                        </label>
                        <textarea
                            className="w-full h-24 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none font-mono text-sm"
                            placeholder="body { font-family: sans-serif; }"
                            value={formData.cssContent}
                            onChange={(e) => setFormData({ ...formData, cssContent: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" isLoading={createMutation.isPending}>
                            Crear Plantilla
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Create Page from Template Modal - Placeholder */}
            <Modal
                isOpen={isCreatePageModalOpen}
                onClose={() => {
                    setIsCreatePageModalOpen(false);
                    setSelectedTemplate(null);
                }}
                title={`Crear página desde: ${selectedTemplate?.name}`}
            >
                <p className="text-slate-500 mb-4">
                    Esta funcionalidad se implementará en la siguiente fase.
                    Podrás seleccionar un cliente y crear una página basada en esta plantilla.
                </p>
                <div className="flex justify-end">
                    <Button variant="outline" onClick={() => setIsCreatePageModalOpen(false)}>
                        Cerrar
                    </Button>
                </div>
            </Modal>
        </AppLayout>
    );
}
