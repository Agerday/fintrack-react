import { z } from 'zod';

// EU VAT number: 2-letter country prefix + 8 to 12 letters or digits (e.g. BE0123456789)
const vatNumberPattern = /^[A-Z]{2}[A-Z0-9]{8,12}$/;

export const companySchema = z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    address: z.string().trim().min(1, 'Address is required'),
    postalCode: z.string().trim().min(1, 'Postal code is required'),
    city: z.string().trim().min(1, 'City is required'),
    country: z.string().trim().min(1, 'Country is required'),
    // toUpperCase normalizes "be0123456789" before the pattern check, without changing the type
    vatNumber: z
        .string()
        .trim()
        .toUpperCase()
        .regex(vatNumberPattern, 'Enter a valid VAT number (e.g. BE0123456789)'),
});

export type CompanyFormValues = z.infer<typeof companySchema>;
