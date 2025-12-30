import { ReactNode } from 'react';
import { Sidebar, NavItem } from './Sidebar';
import { ToastContainer } from '../ui/Toast';

const defaultNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { label: 'Clientes', href: '/customers', icon: 'group' },
    { label: 'Pedidos', href: '/orders', icon: 'receipt_long' },
    { label: 'Plantillas', href: '/templates', icon: 'description' },
    { label: 'Páginas', href: '/pages', icon: 'web' },
    { label: 'Configuración', href: '/settings', icon: 'settings' },
];

export interface AppLayoutProps {
    children: ReactNode;
    navItems?: NavItem[];
}

export function AppLayout({ children, navItems = defaultNavItems }: AppLayoutProps) {
    // TODO: Get user info from auth context
    const userInfo = {
        name: 'Carlos Ruiz',
        email: 'carlos@empresa.com',
    };

    return (
        <div className="flex h-screen w-full overflow-hidden">
            <Sidebar navItems={navItems} userInfo={userInfo} />

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50 dark:bg-background-dark">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-2xl">layers</span>
                        <span className="text-lg font-bold text-slate-900 dark:text-white">SaaS App</span>
                    </div>
                    <button className="p-2 text-slate-600 dark:text-slate-300">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </header>

                {/* Page Content */}
                <div className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-8 md:px-10">
                    {children}
                </div>
            </main>

            {/* Toast Notifications */}
            <ToastContainer />
        </div>
    );
}
