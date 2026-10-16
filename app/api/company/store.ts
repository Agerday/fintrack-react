import { sharedStore } from '@/lib/shared-store';
import { company as seedCompany } from '@/features/company/data';
import type { Company } from '@/features/company/types';

export const companyStore = sharedStore('company', () => ({
    company: { ...seedCompany } as Company,
}));
