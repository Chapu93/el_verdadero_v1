import { useEffect, useRef, useState, useCallback } from 'react';
import grapesjs, { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import gjsBlocksBasic from 'grapesjs-blocks-basic';
import './grapes-editor.css';

interface GrapesEditorProps {
    initialHtml?: string;
    initialCss?: string;
    onSave?: (html: string, css: string) => void;
    onChange?: (html: string, css: string) => void;
}

// Function to parse HTML file and extract body content and styles
function parseHtmlFile(htmlContent: string): { html: string; css: string } {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Extract CSS from <style> tags
    let css = '';
    const styleTags = doc.querySelectorAll('style');
    styleTags.forEach(style => {
        css += style.textContent + '\n';
    });

    // Extract body content (excluding scripts)
    const body = doc.body;
    if (body) {
        // Remove script tags from body
        const scripts = body.querySelectorAll('script');
        scripts.forEach(script => script.remove());

        return {
            html: body.innerHTML,
            css: css.trim()
        };
    }

    return { html: htmlContent, css: '' };
}

export function GrapesEditor({ initialHtml = '', initialCss = '', onSave, onChange }: GrapesEditorProps) {
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const editorInstance = useRef<Editor | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [activePanel, setActivePanel] = useState<'blocks' | 'styles' | 'layers'>('blocks');
    const [activeDevice, setActiveDevice] = useState<'Desktop' | 'Tablet' | 'Mobile'>('Desktop');

    // Initialize GrapesJS after component mounts
    useEffect(() => {
        // Small delay to ensure container has dimensions
        const initTimeout = setTimeout(() => {
            if (!editorContainerRef.current || editorInstance.current) return;

            console.log('Initializing GrapesJS...');

            const editor = grapesjs.init({
                container: editorContainerRef.current,
                height: '100%',
                width: 'auto',
                fromElement: false,
                storageManager: false,
                plugins: [gjsBlocksBasic, gjsPresetWebpage],
                pluginsOpts: {
                    [gjsBlocksBasic as any]: {
                        flexGrid: true,
                        stylePrefix: 'gjs-',
                        addBasicStyle: true,
                        blocks: ['column1', 'column2', 'column3', 'column3-7', 'text', 'link', 'image', 'video', 'map'],
                        category: 'Básicos',
                    },
                    [gjsPresetWebpage as any]: {
                        blocksBasicOpts: false,  // Disable since we use grapesjs-blocks-basic
                        navbarOpts: { blocks: ['navbar'] },
                        countdownOpts: false,
                        formsOpts: { blocks: ['form', 'input', 'textarea', 'select', 'button', 'label', 'checkbox', 'radio'] },
                    },
                },
                canvas: {
                    styles: [
                        'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
                        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
                        'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
                    ],
                    scripts: [
                        'https://cdn.tailwindcss.com?plugins=forms,container-queries',
                    ],
                },
                deviceManager: {
                    devices: [
                        { name: 'Desktop', width: '' },
                        { name: 'Tablet', width: '768px', widthMedia: '992px' },
                        { name: 'Mobile', width: '320px', widthMedia: '480px' },
                    ],
                },
                blockManager: {
                    appendTo: '#gjs-blocks-container',
                },
                layerManager: {
                    appendTo: '#gjs-layers-container',
                },
                styleManager: {
                    appendTo: '#gjs-styles-container',
                    sectors: [
                        {
                            name: 'General',
                            open: true,
                            properties: ['display', 'position', 'float'],
                        },
                        {
                            name: 'Dimensiones',
                            open: false,
                            properties: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
                        },
                        {
                            name: 'Tipografía',
                            open: false,
                            properties: ['font-family', 'font-size', 'font-weight', 'color', 'text-align'],
                        },
                        {
                            name: 'Decoración',
                            open: false,
                            properties: ['background-color', 'border-radius', 'border', 'box-shadow'],
                        },
                    ],
                },
                selectorManager: {
                    appendTo: '#gjs-selectors-container',
                },
                traitManager: {
                    appendTo: '#gjs-traits-container',
                },
            });

            // Load initial content when editor is ready
            editor.on('load', () => {
                console.log('GrapesJS loaded');

                // Set initial content
                if (initialHtml) {
                    editor.setComponents(initialHtml);
                }
                if (initialCss) {
                    editor.setStyle(initialCss);
                }

                // Force canvas refresh
                editor.refresh();
                setIsReady(true);
            });

            // Listen for changes
            editor.on('update', () => {
                if (onChange) {
                    const html = editor.getHtml();
                    const css = editor.getCss() || '';
                    onChange(html, css);
                }
            });

            editorInstance.current = editor;
        }, 100);

        return () => {
            clearTimeout(initTimeout);
            if (editorInstance.current) {
                editorInstance.current.destroy();
                editorInstance.current = null;
            }
        };
    }, []);

    // Handle device change
    const handleDeviceChange = useCallback((device: 'Desktop' | 'Tablet' | 'Mobile') => {
        if (editorInstance.current) {
            editorInstance.current.setDevice(device);
            setActiveDevice(device);
        }
    }, []);

    // Handle save
    const handleSave = useCallback(() => {
        if (editorInstance.current && onSave) {
            const html = editorInstance.current.getHtml();
            const css = editorInstance.current.getCss() || '';
            onSave(html, css);
        }
    }, [onSave]);

    // Handle undo/redo
    const handleUndo = useCallback(() => {
        editorInstance.current?.UndoManager.undo();
    }, []);

    const handleRedo = useCallback(() => {
        editorInstance.current?.UndoManager.redo();
    }, []);

    // Handle view code
    const handleViewCode = useCallback(() => {
        if (!editorInstance.current) return;
        const modal = editorInstance.current.Modal;
        const html = editorInstance.current.getHtml() || '';
        const css = editorInstance.current.getCss() || '';
        modal.setTitle('Código Generado');
        modal.setContent(`
            <div style="padding: 20px; background: #1e293b; color: #e2e8f0; font-family: monospace; max-height: 400px; overflow: auto;">
                <h4 style="margin-bottom: 10px; color: #60a5fa;">HTML:</h4>
                <pre style="white-space: pre-wrap; word-break: break-all; font-size: 12px;">${html.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                <h4 style="margin: 20px 0 10px; color: #60a5fa;">CSS:</h4>
                <pre style="white-space: pre-wrap; word-break: break-all; font-size: 12px;">${css}</pre>
            </div>
        `);
        modal.open();
    }, []);

    // Handle preview
    const handlePreview = useCallback(() => {
        editorInstance.current?.runCommand('preview');
    }, []);

    // Handle fullscreen
    const handleFullscreen = useCallback(() => {
        editorInstance.current?.runCommand('fullscreen');
    }, []);

    // Handle clear canvas
    const handleClear = useCallback(() => {
        if (editorInstance.current && confirm('¿Limpiar todo el contenido?')) {
            editorInstance.current.DomComponents.clear();
            editorInstance.current.CssComposer.clear();
        }
    }, []);

    // Handle import HTML file
    const handleImportClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !editorInstance.current) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (content) {
                const { html, css } = parseHtmlFile(content);

                // Clear current content
                editorInstance.current?.DomComponents.clear();
                editorInstance.current?.CssComposer.clear();

                // Load new content
                editorInstance.current?.setComponents(html);
                if (css) {
                    editorInstance.current?.setStyle(css);
                }

                // Refresh canvas
                editorInstance.current?.refresh();

                alert(`Plantilla importada: ${file.name}`);
            }
        };
        reader.readAsText(file);

        // Reset input so same file can be selected again
        event.target.value = '';
    }, []);

    return (
        <div className="grapes-editor-wrapper h-full flex flex-col">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".html,.htm"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Custom Toolbar */}
            <div className="grapes-toolbar flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
                <div className="flex items-center gap-1">
                    {/* Device Switcher */}
                    <button
                        onClick={() => handleDeviceChange('Desktop')}
                        className={`p-2 rounded transition-colors ${activeDevice === 'Desktop'
                            ? 'bg-primary text-white'
                            : 'hover:bg-slate-700 text-slate-300 hover:text-white'
                            }`}
                        title="Desktop"
                    >
                        <span className="material-symbols-outlined text-[20px]">desktop_windows</span>
                    </button>
                    <button
                        onClick={() => handleDeviceChange('Tablet')}
                        className={`p-2 rounded transition-colors ${activeDevice === 'Tablet'
                            ? 'bg-primary text-white'
                            : 'hover:bg-slate-700 text-slate-300 hover:text-white'
                            }`}
                        title="Tablet"
                    >
                        <span className="material-symbols-outlined text-[20px]">tablet</span>
                    </button>
                    <button
                        onClick={() => handleDeviceChange('Mobile')}
                        className={`p-2 rounded transition-colors ${activeDevice === 'Mobile'
                            ? 'bg-primary text-white'
                            : 'hover:bg-slate-700 text-slate-300 hover:text-white'
                            }`}
                        title="Mobile"
                    >
                        <span className="material-symbols-outlined text-[20px]">smartphone</span>
                    </button>

                    <div className="w-px h-6 bg-slate-600 mx-2" />

                    {/* Undo/Redo */}
                    <button
                        onClick={handleUndo}
                        className="p-2 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Deshacer"
                    >
                        <span className="material-symbols-outlined text-[20px]">undo</span>
                    </button>
                    <button
                        onClick={handleRedo}
                        className="p-2 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Rehacer"
                    >
                        <span className="material-symbols-outlined text-[20px]">redo</span>
                    </button>

                    <div className="w-px h-6 bg-slate-600 mx-2" />

                    {/* Import HTML */}
                    <button
                        onClick={handleImportClick}
                        className="p-2 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Importar HTML"
                    >
                        <span className="material-symbols-outlined text-[20px]">upload_file</span>
                    </button>

                    {/* Clear */}
                    <button
                        onClick={handleClear}
                        className="p-2 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Limpiar canvas"
                    >
                        <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
                    </button>

                    <div className="w-px h-6 bg-slate-600 mx-2" />

                    {/* View options */}
                    <button
                        onClick={handleFullscreen}
                        className="p-2 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Pantalla completa"
                    >
                        <span className="material-symbols-outlined text-[20px]">fullscreen</span>
                    </button>
                    <button
                        onClick={handlePreview}
                        className="p-2 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Vista previa"
                    >
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {!isReady && (
                        <span className="text-slate-400 text-sm animate-pulse">Cargando editor...</span>
                    )}
                    {/* View Code */}
                    <button
                        onClick={handleViewCode}
                        className="p-2 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Ver Código"
                    >
                        <span className="material-symbols-outlined text-[20px]">code</span>
                    </button>
                    <div className="w-px h-6 bg-slate-600 mx-2" />
                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">save</span>
                        Guardar
                    </button>
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex overflow-hidden min-h-0">
                {/* Left Sidebar - Panels */}
                <div className="w-72 flex flex-col bg-slate-900 border-r border-slate-700 flex-shrink-0">
                    {/* Panel Tabs */}
                    <div className="flex bg-slate-800 flex-shrink-0">
                        <button
                            onClick={() => setActivePanel('blocks')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${activePanel === 'blocks'
                                ? 'text-primary border-b-2 border-primary bg-slate-900'
                                : 'text-slate-400 hover:text-white border-b-2 border-transparent'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px] block mx-auto mb-1">widgets</span>
                            Bloques
                        </button>
                        <button
                            onClick={() => setActivePanel('styles')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${activePanel === 'styles'
                                ? 'text-primary border-b-2 border-primary bg-slate-900'
                                : 'text-slate-400 hover:text-white border-b-2 border-transparent'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px] block mx-auto mb-1">palette</span>
                            Estilos
                        </button>
                        <button
                            onClick={() => setActivePanel('layers')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${activePanel === 'layers'
                                ? 'text-primary border-b-2 border-primary bg-slate-900'
                                : 'text-slate-400 hover:text-white border-b-2 border-transparent'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px] block mx-auto mb-1">layers</span>
                            Capas
                        </button>
                    </div>

                    {/* Panel Content */}
                    <div className="flex-1 overflow-y-auto">
                        <div id="gjs-blocks-container" className={activePanel === 'blocks' ? 'p-2' : 'hidden'} />
                        <div className={activePanel === 'styles' ? 'p-2' : 'hidden'}>
                            <div id="gjs-selectors-container" className="mb-2" />
                            <div id="gjs-styles-container" />
                            <div id="gjs-traits-container" className="mt-2 pt-2 border-t border-slate-700" />
                        </div>
                        <div id="gjs-layers-container" className={activePanel === 'layers' ? 'p-2' : 'hidden'} />
                    </div>
                </div>

                {/* Canvas Area - this is where GrapesJS renders */}
                <div
                    ref={editorContainerRef}
                    className="flex-1 gjs-editor-canvas min-w-0"
                    style={{ minHeight: '500px' }}
                />
            </div>
        </div>
    );
}
