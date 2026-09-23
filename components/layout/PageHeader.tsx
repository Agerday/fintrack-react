type PageHeaderProps = {
    title: string;
    description: string;
    action?: React.ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
                <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>
            {action}
        </div>
    );
}
