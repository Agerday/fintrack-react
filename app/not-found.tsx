import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
            <h2 className="text-xl font-semibold">Page not found</h2>
            <p className="text-slate-500">The page you are looking for does not exist.</p>
            <Link href="/" className={buttonVariants()}>
                Back to dashboard
            </Link>
        </div>
    );
}
