import { InvoiceTable } from "@/features/invoices/components/InvoiceTable";

export default function InvoicesPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Invoices
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage and track your invoices.
                    </p>
                </div>

                <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                    Create invoice
                </button>
            </div>

            <InvoiceTable />
        </div>
    );
}