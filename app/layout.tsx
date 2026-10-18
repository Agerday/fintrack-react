import './globals.css';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Providers from '@/app/providers';
import { AppShell } from '@/components/layout/AppShell';

// next/font self-hosts the font at build time (no request to Google at runtime) and exposes it
// as a CSS variable, picked up by --font-sans in globals.css
const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

// Each page only exports its own name ({ title: 'Invoices' }), the template adds the app name:
// "Invoices · FinTrack". Like Angular's Route.title with a TitleStrategy
export const metadata: Metadata = {
    title: { template: '%s · FinTrack', default: 'FinTrack' },
    description: 'Invoice and client management.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        // next-themes adds the theme class to <html> before React hydrates: expected mismatch
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable}`}
            suppressHydrationWarning
        >
            <body>
                <Providers>
                    <AppShell>{children}</AppShell>
                </Providers>
            </body>
        </html>
    );
}
