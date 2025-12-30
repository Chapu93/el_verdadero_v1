import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout';
import { Button, Card, Input, Skeleton } from '@/components/ui';
import { toast } from '@/components/ui/Toast';
import { usePage, pagesApi, PageElement } from '../api/pages.api';

interface ElementEditorProps {
    element: PageElement;
    onSave: (content: string) => void;
    isSaving: boolean;
}

function ElementEditor({ element, onSave, isSaving }: ElementEditorProps) {
    const [value, setValue] = useState(element.content);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setValue(element.content);
        setIsDirty(false);
    }, [element.content]);

    const handleChange = (newValue: string) => {
        setValue(newValue);
        setIsDirty(newValue !== element.content);
    };

    const handleSave = () => {
        onSave(value);
        setIsDirty(false);
    };

    const getIcon = () => {
        switch (element.type) {
            case 'TEXT': return 'text_fields';
            case 'IMAGE': return 'image';
            case 'COLOR': return 'palette';
            case 'LINK': return 'link';
            default: return 'code';
        }
    };

    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">{getIcon()}</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {element.label || element.elementKey}
                    </span>
                    <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {element.type}
                    </span>
                </div>
                {isDirty && (
                    <Button size="sm" onClick={handleSave} isLoading={isSaving}>
                        Guardar
                    </Button>
                )}
            </div>

            {element.type === 'COLOR' ? (
                <div className="flex items-center gap-3">
                    <input
                        type="color"
                        value={value || '#000000'}
                        onChange={(e) => handleChange(e.target.value)}
                        className="w-12 h-10 rounded border border-slate-200 cursor-pointer"
                    />
                    <Input
                        value={value}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder="#000000"
                        className="flex-1"
                    />
                </div>
            ) : element.type === 'IMAGE' ? (
                <div className="space-y-2">
                    <Input
                        value={value}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder="https://ejemplo.com/imagen.jpg"
                    />
                    {value && (
                        <img
                            src={value}
                            alt="Preview"
                            className="h-24 object-cover rounded border border-slate-200"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    )}
                </div>
            ) : (
                <textarea
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder="Contenido..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none min-h-[80px]"
                />
            )}
        </div>
    );
}

export function PageEditorPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'content' | 'appearance'>('content');

    const { data: pageData, isLoading, isError } = usePage(id || '');
    const page = pageData?.data;

    const [savingElement, setSavingElement] = useState<string | null>(null);

    // Theme Config State
    const themeConfig = useMemo(() => {
        try {
            return page?.theme ? JSON.parse(page.theme) : { mode: 'light', palette: {} };
        } catch {
            return { mode: 'light', palette: {} };
        }
    }, [page?.theme]);

    const updatePageMutation = useMutation({
        mutationFn: (data: any) => pagesApi.update(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pages', id] });
            toast.success('Página actualizada');
        },
    });

    const updateElementMutation = useMutation({
        mutationFn: ({ elementKey, content }: { elementKey: string; content: string }) =>
            pagesApi.updateElement(id!, elementKey, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pages', id] });
            toast.success('Elemento guardado');
            setSavingElement(null);
        },
        onError: () => {
            toast.error('Error al guardar');
            setSavingElement(null);
        },
    });

    const publishMutation = useMutation({
        mutationFn: (publish: boolean) =>
            publish ? pagesApi.publish(id!) : pagesApi.unpublish(id!),
        onSuccess: (_, publish) => {
            queryClient.invalidateQueries({ queryKey: ['pages'] });
            toast.success(publish ? 'Página publicada' : 'Página despublicada');
        },
    });

    const handleSaveElement = (elementKey: string, content: string) => {
        setSavingElement(elementKey);
        updateElementMutation.mutate({ elementKey, content });
    };

    const handleThemeUpdate = (key: string, value: any) => {
        const newTheme = { ...themeConfig, [key]: value };
        updatePageMutation.mutate({ theme: JSON.stringify(newTheme) });
    };

    const handlePaletteUpdate = (key: string, value: string) => {
        const newTheme = {
            ...themeConfig,
            palette: { ...themeConfig.palette, [key]: value }
        };
        updatePageMutation.mutate({ theme: JSON.stringify(newTheme) });
    };

    // Default Palette Variables likely in the template
    const paletteVars = [
        { key: '--primary', label: 'Color Primario' },
        { key: '--secondary', label: 'Color Secundario' },
        { key: '--bg', label: 'Fondo Página' },
        { key: '--text', label: 'Color Texto' },
        { key: '--header-bg', label: 'Fondo Header' },
    ];

    if (isLoading) {
        return (
            <AppLayout>
                <div className="flex flex-col gap-6">
                    <Skeleton className="h-10 w-64" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card><Skeleton className="h-[400px] w-full" /></Card>
                        <Card><Skeleton className="h-[400px] w-full" /></Card>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (isError || !page) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center py-20">
                    <h1 className="text-xl font-bold">Página no encontrada</h1>
                    <Button onClick={() => navigate('/pages')} className="mt-4">Volver</Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={() => navigate('/pages')}>
                            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{page.name}</h1>
                            <p className="text-sm text-slate-500">{page.template?.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {page.isPublished && (
                            <Button variant="outline" onClick={() => window.open(`http://localhost:4000/p/${page.slug}`, '_blank')}>
                                <span className="material-symbols-outlined mr-2">visibility</span> Ver
                            </Button>
                        )}
                        <Button
                            variant={page.isPublished ? 'outline' : 'primary'}
                            onClick={() => publishMutation.mutate(!page.isPublished)}
                            isLoading={publishMutation.isPending}
                        >
                            {page.isPublished ? 'Despublicar' : 'Publicar'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Panel: Editor */}
                    <Card padding="none" className="overflow-hidden flex flex-col h-[600px]">
                        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                            <button
                                onClick={() => setActiveTab('content')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'content'
                                        ? 'bg-white dark:bg-slate-900 text-primary border-t-2 border-primary'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Contenido
                            </button>
                            <button
                                onClick={() => setActiveTab('appearance')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'appearance'
                                        ? 'bg-white dark:bg-slate-900 text-primary border-t-2 border-primary'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Apariencia
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            {activeTab === 'content' ? (
                                page.elements && page.elements.length > 0 ? (
                                    <div className="space-y-4">
                                        {page.elements.map((element) => (
                                            <ElementEditor
                                                key={element.id}
                                                element={element}
                                                onSave={(content) => handleSaveElement(element.elementKey, content)}
                                                isSaving={savingElement === element.elementKey}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-500">
                                        <p>No hay elementos editables.</p>
                                    </div>
                                )
                            ) : (
                                <div className="space-y-6">
                                    {/* Dark Mode Toggle */}
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                        <div>
                                            <h3 className="font-medium text-slate-900 dark:text-white">Modo Oscuro</h3>
                                            <p className="text-xs text-slate-500">Activa el tema oscuro por defecto</p>
                                        </div>
                                        <button
                                            onClick={() => handleThemeUpdate('mode', themeConfig.mode === 'dark' ? 'light' : 'dark')}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${themeConfig.mode === 'dark' ? 'bg-primary' : 'bg-slate-200'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${themeConfig.mode === 'dark' ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    {/* Palette Editor */}
                                    <div>
                                        <h3 className="font-medium text-slate-900 dark:text-white mb-3">Paleta de Colores</h3>
                                        <div className="space-y-3">
                                            {paletteVars.map((v) => (
                                                <div key={v.key} className="flex items-center justify-between">
                                                    <span className="text-sm text-slate-600 dark:text-slate-300">{v.label}</span>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-8 h-8 rounded border border-slate-200"
                                                            style={{ backgroundColor: themeConfig.palette?.[v.key] || '#cccccc' }}
                                                        />
                                                        <Input
                                                            className="w-32 h-8 text-xs"
                                                            placeholder="Default"
                                                            value={themeConfig.palette?.[v.key] || ''}
                                                            onChange={(e) => handlePaletteUpdate(v.key, e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-400 mt-2">
                                            Deja en blanco para usar el valor por defecto de la plantilla.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Preview */}
                    <Card padding="none" className="overflow-hidden h-[600px] flex flex-col">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                            <h2 className="font-medium">Vista Previa</h2>
                            <Button size="sm" variant="outline" onClick={() => {
                                // Force reload of iframe
                                const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
                                if (iframe) iframe.src = iframe.src;
                            }}>
                                <span className="material-symbols-outlined text-[16px]">refresh</span>
                            </Button>
                        </div>
                        <iframe
                            id="preview-iframe"
                            src={`http://localhost:4000/p/${page.slug}?t=${Date.now()}`} // Add timestamp to prevent caching during edit
                            className="w-full flex-1 border-0"
                            title="Preview"
                        />
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
