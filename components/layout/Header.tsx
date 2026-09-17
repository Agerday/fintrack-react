export function Header() {
    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-8">
            <div>
                <p className="text-sm text-slate-500">Welcome back</p>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-medium text-white">
                    JD
                </div>

                <div>
                    <p className="text-sm font-medium">John Doe</p>
                    <p className="text-xs text-slate-500">Administrator</p>
                </div>
            </div>
        </header>
    );
}
