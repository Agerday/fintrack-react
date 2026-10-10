import type { LucideIcon } from 'lucide-react';
import { Bell, Building2, FileText, Landmark, Percent } from 'lucide-react';
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
        description: 'Name, address, VAT number and logo shown on your invoices.',
        icon: Building2,
        tone: 'chart-1',
    },
    {
        id: 'invoices',
        title: 'Invoice defaults',
        description: 'Numbering format, payment terms and default due date.',
        icon: FileText,
        tone: 'chart-5',
    },
    {
        id: 'payments',
        title: 'Bank & payments',
        description: 'Your IBAN and the payment methods you accept.',
        icon: Landmark,
        tone: 'chart-3',
    },
    {
        id: 'taxes',
        title: 'Taxes',
        description: 'VAT rates applied to your invoices.',
        icon: Percent,
        tone: 'chart-2',
    },
    {
        id: 'notifications',
        title: 'Notifications',
        description: 'Choose which real-time alerts you receive.',
        icon: Bell,
        tone: 'chart-4',
    },
];

export function findSettingsSection(id: string): SettingsSection | undefined {
    return settingsSections.find((section) => section.id === id);
}
