import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { invoiceListHref } from '../rules';
import { invoiceStatuses, type InvoiceListParams } from '../schema';
import { statusLabels } from '../status';

const options = [
    { value: 'all', label: 'All' },
    ...invoiceStatuses.map((status) => ({ value: status, label: statusLabels[status] })),
] as const;

type InvoiceStatusFilterProps = {
    params: InvoiceListParams;
};

// Links, not buttons: each filter is a URL the user can open in a new tab or share
export function InvoiceStatusFilter({ params }: InvoiceStatusFilterProps) {
    return (
        <nav aria-label="Filter by status" className="flex flex-wrap gap-1">
            {options.map(({ value, label }) => {
                const active = params.status === value;
                return (
                    <Link
                        key={value}
                        href={invoiceListHref(params, { status: value })}
                        aria-current={active ? 'page' : undefined}
                        replace
                        scroll={false}
                        className={buttonVariants({
                            variant: active ? 'secondary' : 'ghost',
                            size: 'sm',
                        })}
                    >
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}
