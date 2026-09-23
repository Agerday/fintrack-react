import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-8">
            <div>
                <p className="text-sm text-slate-500">Welcome back</p>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted">
                    <div className="text-right">
                        <p className="text-sm font-medium leading-none">Adrien Gerday</p>
                        <p className="text-xs text-muted-foreground">Admin</p>
                    </div>
                    <Avatar className="h-9 w-9">
                        <AvatarImage src="/avatar.png" alt="Adrien Gerday" />
                        <AvatarFallback>AG</AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">Log out</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
