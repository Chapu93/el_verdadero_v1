import { clsx } from 'clsx';

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    showFirstLast?: boolean;
    showInfo?: boolean;
    totalItems?: number;
    itemsPerPage?: number;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    showFirstLast = true,
    showInfo = false,
    totalItems,
    itemsPerPage = 10,
}: PaginationProps) {
    const getVisiblePages = () => {
        const pages: (number | 'ellipsis')[] = [];
        const showPages = 5;

        if (totalPages <= showPages) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        pages.push(1);

        if (currentPage > 3) {
            pages.push('ellipsis');
        }

        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            if (!pages.includes(i)) {
                pages.push(i);
            }
        }

        if (currentPage < totalPages - 2) {
            pages.push('ellipsis');
        }

        if (!pages.includes(totalPages)) {
            pages.push(totalPages);
        }

        return pages;
    };

    const pageButtonStyles = clsx(
        'flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-all',
        'border border-transparent'
    );

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems || 0);

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {showInfo && totalItems !== undefined && (
                <div className="text-sm text-slate-500 dark:text-slate-400">
                    Mostrando <span className="font-semibold text-slate-900 dark:text-white">{startItem}</span> a{' '}
                    <span className="font-semibold text-slate-900 dark:text-white">{endItem}</span> de{' '}
                    <span className="font-semibold text-slate-900 dark:text-white">{totalItems}</span> resultados
                </div>
            )}

            <nav aria-label="Pagination" className="flex items-center gap-2">
                {showFirstLast && (
                    <button
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1}
                        className={clsx(pageButtonStyles, 'text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50')}
                    >
                        <span className="material-symbols-outlined text-[20px]">first_page</span>
                    </button>
                )}

                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={clsx(pageButtonStyles, 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-primary disabled:opacity-50')}
                >
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>

                <div className="flex items-center gap-1">
                    {getVisiblePages().map((page, index) =>
                        page === 'ellipsis' ? (
                            <span key={`ellipsis-${index}`} className="flex size-9 items-center justify-center text-slate-400 pb-2">
                                ...
                            </span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={clsx(
                                    pageButtonStyles,
                                    page === currentPage
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                )}
                            >
                                {page}
                            </button>
                        )
                    )}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={clsx(pageButtonStyles, 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-primary disabled:opacity-50')}
                >
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>

                {showFirstLast && (
                    <button
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className={clsx(pageButtonStyles, 'text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50')}
                    >
                        <span className="material-symbols-outlined text-[20px]">last_page</span>
                    </button>
                )}
            </nav>
        </div>
    );
}
