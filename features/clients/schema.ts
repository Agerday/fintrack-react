import { z } from 'zod';
import { countries, CountryCode } from '@/features/clients/countries';

const countryCodes = countries.map((c) => c.code) as [CountryCode, ...CountryCode[]];

export const clientSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.email('Enter a valid email address'),
    countryCode: z.enum(countryCodes, { message: 'select a country' }),
    phone: z.string().min(4, 'Enter a valid phone number').regex(/^\d+$/, 'Digits only'),
    company: z.string().min(1, 'Company is required'),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
