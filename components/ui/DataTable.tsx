import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

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
};

export function DataTable<T>({ data, columns }: DataTableProps<T>) {
    return (
        <div className="fintrack-table-wrapper">
            <Table className="fintrack-table table-fixed">
                <TableHeader>
                    <TableRow>
                        {columns.map((column) => (
                            <TableHead key={String(column.key)} className={column.className}>
                                {column.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {data.map((row) => (
                        <TableRow key={String(row[columns[0].key])}>
                            {columns.map((column) => {
                                const value = row[column.key];

                                return (
                                    <TableCell
                                        key={String(column.key)}
                                        className={column.className}
                                    >
                                        {column.render ? column.render(value, row) : String(value)}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
