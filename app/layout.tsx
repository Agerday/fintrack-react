import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import Providers from '@/app/providers';
import { AppShell } from '@/components/layout/AppShell';

// next/font self-hosts the font at build time (no request to Google at runtime) and exposes it
// as a CSS variable, picked up by --font-sans in globals.css
const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
            <body>
                <Providers>
                    <AppShell>{children}</AppShell>
                </Providers>
            </body>
        </html>
    );
}
