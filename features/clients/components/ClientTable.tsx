const clients = [
    {
        name: "Acme Corporation",
        email: "billing@acme.com",
        invoices: 12,
        total: "$18,400",
    },
    {
        name: "Globex Inc.",
        email: "finance@globex.com",
        invoices: 8,
        total: "$11,250",
    },
    {
        name: "Soylent Corp.",
        email: "accounts@soylent.com",
        invoices: 6,
        total: "$9,800",
    },
    {
        name: "Initech",
        email: "billing@initech.com",
        invoices: 4,
        total: "$4,200",
    },
];

export function ClientTable() {
    return (
        <div className="overflow-hidden rounded-xl border bg-white">
            <table className="w-full">
                <thead>
                <tr className="border-b bg-slate-50 text-left">
                    <th className="px-6 py-3 text-xs font-medium uppercase text-slate-500">
                        Client
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase text-slate-500">
                        Email
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase text-slate-500">
                        Invoices
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase text-slate-500">
                        Total billed
                    </th>
                </tr>
                </thead>

                <tbody className="divide-y">
                {clients.map((client) => (
                    <tr key={client.name} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-medium">
                            {client.name}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                            {client.email}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                            {client.invoices}
                        </td>

                        <td className="px-6 py-4 text-sm font-medium">
                            {client.total}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}