type TicketSummaryProps = {
    // label -> value already formatted, '—' while unknown
    rows: { label: string; value: string; emphasis?: boolean }[];
};

// The read-only lines under an order form: price, estimate, cash, held quantity...
export function TicketSummary({ rows }: TicketSummaryProps) {
    return (
        <dl className="space-y-1.5 text-sm">
            {rows.map(({ label, value, emphasis }) => (
                <div key={label} className="flex justify-between">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className={emphasis ? 'font-medium tabular-nums' : 'tabular-nums'}>
                        {value}
                    </dd>
                </div>
            ))}
        </dl>
    );
}
