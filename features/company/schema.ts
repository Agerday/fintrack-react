import { z } from 'zod';

// EU VAT number formats after the country prefix, as checked by the EU VIES service.
// One loose pattern for all countries let wrong lengths through (BE01234567: Belgium needs 10)
const vatFormats: Record<string, RegExp> = {
    AT: /^U\d{8}$/,
    BE: /^[01]\d{9}$/,
    BG: /^\d{9,10}$/,
    CY: /^\d{8}[A-Z]$/,
    CZ: /^\d{8,10}$/,
    DE: /^\d{9}$/,
    DK: /^\d{8}$/,
    EE: /^\d{9}$/,
    EL: /^\d{9}$/,
    ES: /^[A-Z0-9]\d{7}[A-Z0-9]$/,
    FI: /^\d{8}$/,
    FR: /^[A-Z0-9]{2}\d{9}$/,
    HR: /^\d{11}$/,
    HU: /^\d{8}$/,
    IE: /^\d[A-Z0-9+*]\d{5}[A-Z]{1,2}$/,
    IT: /^\d{11}$/,
    LT: /^(\d{9}|\d{12})$/,
    LU: /^\d{8}$/,
    LV: /^\d{11}$/,
    MT: /^\d{8}$/,
    NL: /^\d{9}B\d{2}$/,
    PL: /^\d{10}$/,
    PT: /^\d{9}$/,
    RO: /^\d{2,10}$/,
    SE: /^\d{12}$/,
    SI: /^\d{8}$/,
    SK: /^\d{10}$/,
};

function isValidVatNumber(value: string): boolean {
    const format = vatFormats[value.slice(0, 2)];
    return format !== undefined && format.test(value.slice(2));
}

export const companySchema = z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    address: z.string().trim().min(1, 'Address is required'),
    postalCode: z.string().trim().min(1, 'Postal code is required'),
    city: z.string().trim().min(1, 'City is required'),
    country: z.string().trim().min(1, 'Country is required'),
    // overwrite normalizes "be 0123 456 789" to "BE0123456789" before the pattern check,
    // without changing the type (unlike transform, which would split input and output types)
    vatNumber: z
        .string()
        .overwrite((value) => value.replace(/\s/g, '').toUpperCase())
        .refine(isValidVatNumber, 'Enter a valid VAT number (e.g. BE0123456789)'),
});

export type CompanyFormValues = z.infer<typeof companySchema>;
