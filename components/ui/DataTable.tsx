import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import React from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { SortDirection } from '@/lib/list-params';
import { cn } from '@/lib/utils';

export type Column<T> = {
    [K in keyof T]: {
        key: K;
        header: string;
        className?: string;
        render?: (value: T[K], row: T) => React.ReactNode;
        // The header becomes a link that sorts by this column (needs the table's `sort` prop)
        sortable?: boolean;
    };
}[keyof T];

// Sorting lives in the URL: each sortable header links to the list sorted by its column
export type TableSort<T> = {
    key: keyof T;
    dir: SortDirection;
    href: (key: keyof T) => string;
};

type DataTableProps<T> = {
    data: T[];
    columns: Column<T>[];
    renderActions?: (row: T) => React.ReactNode;
    // Unique field used as React key, defaults to the first column
    rowKey?: keyof T;
    sort?: TableSort<T>;
};

function renderCell<T>(column: Column<T>, row: T) {
    return column.render ? column.render(row[column.key], row) : String(row[column.key]);
}

const sortIcons = { asc: ArrowUp, desc: ArrowDown };

type SortHeaderProps<T> = {
    column: Column<T>;
    sort: TableSort<T>;
};

function SortHeader<T>({ column, sort }: SortHeaderProps<T>) {
    const active = sort.key === column.key;
    const Icon = active ? sortIcons[sort.dir] : ArrowUpDown;
    return (
        <Link
            href={sort.href(column.key)}
            replace
            scroll={false}
            className="inline-flex items-center gap-1 hover:text-foreground"
        >
            {column.header}
            <Icon aria-hidden className={cn('size-3.5', !active && 'opacity-40')} />
        </Link>
    );
}

const ariaSort = { asc: 'ascending', desc: 'descending' } as const;

export function DataTable<T>({ data, columns, renderActions, rowKey, sort }: DataTableProps<T>) {
    // The first column is the title of the mobile card (and the default row key)
    const [titleColumn, ...detailColumns] = columns;
    const getKey = (row: T) => String(row[rowKey ?? titleColumn.key]);

    return (
        <>
            {/* Desktop: real table */}
            <Card className="hidden gap-0 py-0 md:flex">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-transparent">
                            {columns.map((column) => (
                                <TableHead
                                    key={String(column.key)}
                                    className={column.className}
                                    aria-sort={
                                        sort?.key === column.key ? ariaSort[sort.dir] : undefined
                                    }
                                >
                                    {sort && column.sortable ? (
                                        <SortHeader column={column} sort={sort} />
                                    ) : (
                                        column.header
                                    )}
                                </TableHead>
                            ))}
                            {renderActions && (
                                <TableHead className="w-0 text-right">Actions</TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row) => (
                            <TableRow key={getKey(row)}>
                                {columns.map((column) => (
                                    <TableCell
                                        key={String(column.key)}
                                        className={column.className}
                                    >
                                        {renderCell(column, row)}
                                    </TableCell>
                                ))}
                                {renderActions && <TableCell>{renderActions(row)}</TableCell>}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* Mobile: stacked cards, first column as the card title */}
            <div className="space-y-3 md:hidden">
                {data.map((row) => (
                    <Card key={getKey(row)} className="gap-0 p-4">
                        {/* Title and actions share the first line to keep cards compact */}
                        <div className="mb-2 flex min-h-7 items-center justify-between gap-2">
                            <div className="min-w-0 font-medium">
                                {renderCell(titleColumn, row)}
                            </div>
                            {renderActions?.(row)}
                        </div>
                        <dl className="divide-y">
                            {detailColumns.map((column) => (
                                <div
                                    key={String(column.key)}
                                    className="flex items-center justify-between gap-4 py-2"
                                >
                                    <dt className="text-xs text-muted-foreground">
                                        {column.header}
                                    </dt>
                                    <dd className="min-w-0 truncate text-right text-sm font-medium">
                                        {renderCell(column, row)}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </Card>
                ))}
            </div>
        </>
    );
}
