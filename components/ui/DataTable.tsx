import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import React from 'react';

export type Column<T> = {
    [K in keyof T]: {
        key: K;
        header: string;
        className?: string;
        render?: (value: T[K], row: T) => React.ReactNode;
    };
}[keyof T];

type DataTableProps<T> = {
    data: T[];
    columns: Column<T>[];
    renderActions?: (row: T) => React.ReactNode;
};

export function DataTable<T>({ data, columns, renderActions }: DataTableProps<T>) {
    return (
        <>
            {/* Desktop: real table */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead key={String(column.key)} className={column.className}>
                                    {column.header}
                                </TableHead>
                            ))}
                            {renderActions && <TableHead className="w-0">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row) => (
                            <TableRow key={String(row[columns[0].key])}>
                                {columns.map((column) => (
                                    <TableCell
                                        key={String(column.key)}
                                        className={column.className}
                                    >
                                        {column.render
                                            ? column.render(row[column.key], row)
                                            : String(row[column.key])}
                                    </TableCell>
                                ))}
                                {renderActions && <TableCell>{renderActions(row)}</TableCell>}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile: stacked cards */}
            <div className="space-y-3 md:hidden">
                {data.map((row) => (
                    <div
                        key={String(row[columns[0].key])}
                        className="rounded-xl border bg-card p-4"
                    >
                        {columns.map((column) => (
                            <div
                                key={String(column.key)}
                                className="flex items-center justify-between py-1.5 first:pt-0 last:pb-0"
                            >
                                <span className="text-xs text-muted-foreground">
                                    {column.header}
                                </span>
                                <span className="text-sm font-medium">
                                    {column.render
                                        ? column.render(row[column.key], row)
                                        : String(row[column.key])}
                                </span>
                            </div>
                        ))}
                        {renderActions && (
                            <div className="mt-3 flex gap-2 border-t pt-3">
                                {renderActions(row)}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
}
