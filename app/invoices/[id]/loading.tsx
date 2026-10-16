import { Skeleton } from '@/components/ui/skeleton';

// Shown at once when navigating to an invoice, while the server renders the page: same layout
// as the page, so nothing jumps when it arrives
export default function InvoiceLoading() {
    return (
        <div className="mx-auto max-w-3xl space-y-6 lg:space-y-8" aria-busy="true">
            <Skeleton className="h-9 w-40" />
            <div className="space-y-2">
                <Skeleton className="h-9 w-56" />
                <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-64 w-full rounded-xl" />
        </div>
    );
}
