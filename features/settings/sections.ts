import type { LucideIcon } from 'lucide-react';
import { Bell, Building2, DatabaseBackup, Palette, UserRound } from 'lucide-react';
import type { NavCardTone } from '@/components/shared/NavCard';

export type SettingsSection = {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    tone: NavCardTone;
};

export const settingsSections: SettingsSection[] = [
    {
        id: 'company',
        title: 'Company profile',
        description: 'Name, address and VAT number of your company.',
        icon: Building2,
        tone: 'chart-1',
    },
    {
        id: 'profile',
        title: 'Your profile',
        description: 'Your name, job title and email.',
        icon: UserRound,
        tone: 'chart-5',
    },
    {
        id: 'appearance',
        title: 'Appearance',
        description: 'Light, dark or follow your system.',
        icon: Palette,
        tone: 'chart-3',
    },
    {
        id: 'notifications',
        title: 'Notifications',
        description: 'Real-time alerts when invoices change in another tab.',
        icon: Bell,
        tone: 'chart-4',
    },
    {
        id: 'demo',
        title: 'Demo data',
        description: 'Restore the seeded invoices, clients and bank account.',
        icon: DatabaseBackup,
        tone: 'chart-2',
    },
];

export function findSettingsSection(id: string): SettingsSection | undefined {
    return settingsSections.find((section) => section.id === id);
}
