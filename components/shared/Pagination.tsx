import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

type PageLinkProps = {
    href: string | undefined;
    children: ReactNode;
};

// No href = no page to go to: a dimmed span, as a link can't be disabled
function PageLink({ href, children }: PageLinkProps) {
    if (!href) {
        return (
            <span
                aria-disabled="true"
                className={buttonVariants({
                    variant: 'outline',
                    size: 'sm',
                    className: 'pointer-events-none opacity-50',
                })}
            >
                {children}
            </span>
        );
    }
    return (
        <Link
            href={href}
            replace
            scroll={false}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
            {children}
        </Link>
    );
}

type PaginationProps = {
    page: number;
    pageCount: number;
    // URL of a page, e.g. (page) => invoiceListHref(params, { page })
    href: (page: number) => string;
};

export function Pagination({ page, pageCount, href }: PaginationProps) {
    if (pageCount <= 1) return null;

    return (
        <nav aria-label="Pagination" className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
                Page {page} of {pageCount}
            </p>
            <div className="flex gap-2">
                <PageLink href={page > 1 ? href(page - 1) : undefined}>
                    <ChevronLeft />
                    Previous
                </PageLink>
                <PageLink href={page < pageCount ? href(page + 1) : undefined}>
                    Next
                    <ChevronRight />
                </PageLink>
            </div>
        </nav>
    );
}
