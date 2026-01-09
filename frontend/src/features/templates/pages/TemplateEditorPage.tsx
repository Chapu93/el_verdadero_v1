import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout';
import { Button, Skeleton } from '@/components/ui';
import { toast } from '@/components/ui/Toast';
import { useTemplate, templatesApi, UpdateTemplateDto } from '../api/templates.api';
import { GrapesEditor } from '../components/GrapesEditor';
import '../components/grapes-editor.css';

export function TemplateEditorPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: templateData, isLoading, isError } = useTemplate(id || '');
    const template = templateData?.data;

    const updateMutation = useMutation({
        mutationFn: (data: UpdateTemplateDto) => templatesApi.update(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            toast.success('Plantilla guardada', 'Los cambios se aplicaron correctamente.');
        },
        onError: () => {
            toast.error('Error', 'No se pudo guardar la plantilla.');
        },
    });

    const handleSave = (html: string, css: string) => {
        updateMutation.mutate({
            htmlContent: html,
            cssContent: css,
        });
    };

    if (isLoading) {
        return (
            <AppLayout>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="flex-1">
                        <Skeleton className="h-full w-full" />
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (isError || !template) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center py-20">
                    <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">error</span>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        Plantilla no encontrada
                    </h1>
                    <p className="text-slate-500 mb-4">La plantilla que buscas no existe.</p>
                    <Button onClick={() => navigate('/templates')}>Volver a plantillas</Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-slate-900">
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/templates')}
                        className="!bg-slate-700 !border-slate-600 !text-white hover:!bg-slate-600"
                    >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    </Button>
                    <div>
                        <h1 className="text-lg font-bold text-white">{template.name}</h1>
                        <p className="text-xs text-slate-400">Editor de Plantilla</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${template.isActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-300'}`}>
                        {template.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                </div>
            </header>

            {/* Editor */}
            <div className="flex-1 overflow-hidden">
                <GrapesEditor
                    initialHtml={template.htmlContent}
                    initialCss={template.cssContent || ''}
                    onSave={handleSave}
                />
            </div>
        </div>
    );
}
