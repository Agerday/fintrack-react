import { company as seedCompany } from '@/features/company/data';
import type { Company } from '@/features/company/types';

export const companyStore = { company: { ...seedCompany } as Company };
