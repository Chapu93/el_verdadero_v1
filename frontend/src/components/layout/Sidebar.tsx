import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';

export interface NavItem {
    label: string;
    href: string;
    icon: string;
}

export interface SidebarProps {
    navItems: NavItem[];
    brandName?: string;
    brandIcon?: string;
    userInfo?: {
        name: string;
        email: string;
        avatar?: string;
    };
}

export function Sidebar({
    navItems,
    brandName = 'SaaS App',
    brandIcon = 'layers',
    userInfo,
}: SidebarProps) {
    const location = useLocation();

    return (
        <aside className="hidden lg:flex w-[280px] flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark h-full shrink-0">
            <div className="flex flex-col justify-between h-full p-6">
                <div className="flex flex-col gap-8">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 rounded-lg size-10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-2xl">
                                {brandIcon}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-slate-900 dark:text-white text-base font-bold leading-none">
                                {brandName}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-normal mt-1">
                                Plan Pro
                            </p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className={clsx(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                                        isActive
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary'
                                    )}
                                >
                                    <span
                                        className={clsx(
                                            'material-symbols-outlined',
                                            isActive && 'filled'
                                        )}
                                    >
                                        {item.icon}
                                    </span>
                                    <span className="text-sm font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* User Profile */}
                {userInfo && (
                    <Link
                        to="/profile"
                        className="flex items-center gap-3 px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-800 mt-auto bg-slate-50 dark:bg-slate-800/50 hover:border-primary/30 transition-colors"
                    >
                        <div
                            className="size-9 rounded-full bg-gradient-to-tr from-primary to-purple-500"
                            style={
                                userInfo.avatar
                                    ? { backgroundImage: `url(${userInfo.avatar})`, backgroundSize: 'cover' }
                                    : undefined
                            }
                        />
                        <div className="flex flex-col overflow-hidden">
                            <p className="text-slate-900 dark:text-white text-sm font-medium truncate">
                                {userInfo.name}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 text-xs truncate">
                                {userInfo.email}
                            </p>
                        </div>
                    </Link>
                )}
            </div>
        </aside>
    );
}
