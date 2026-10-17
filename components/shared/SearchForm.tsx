import Form from 'next/form';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { ListParams } from '@/lib/list-params';

type SearchFormProps = {
    // The list page the search navigates to, e.g. '/invoices'
    action: string;
    label: string;
    defaultValue: string;
    // The other list params to keep in the URL (filters, sort). The page is left out on purpose:
    // a new search starts back on page 1
    keep?: Partial<ListParams>;
};

// A GET form: submitting puts ?q=... in the URL, like a link. next/form turns it into a
// client-side navigation, and it still works before JavaScript loads
export function SearchForm({ action, label, defaultValue, keep = {} }: SearchFormProps) {
    return (
        <Form action={action} role="search" replace scroll={false} className="relative w-full">
            {Object.entries(keep).map(([name, value]) => (
                <input key={name} type="hidden" name={name} value={value} />
            ))}
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            {/* Keyed by the value: the back button brings the field back in line with the URL */}
            <Input
                key={defaultValue}
                type="search"
                name="q"
                aria-label={label}
                placeholder={`${label}…`}
                defaultValue={defaultValue}
                className="pl-8"
            />
        </Form>
    );
}
