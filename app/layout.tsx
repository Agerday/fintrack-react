import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
    title: 'Invoice Manager',
    description: 'Invoice management dashboard',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <div className="min-h-screen bg-slate-50">
                    <Sidebar />

                    <div className="pl-64">
                        <Header />

                        <main className="p-8">{children}</main>
                    </div>
                </div>
            </body>
        </html>
    );
}
