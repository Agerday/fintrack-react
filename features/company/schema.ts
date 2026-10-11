import { z } from 'zod';
import { normalizeVatNumber, vatNumberError } from './rules';

export const companySchema = z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    address: z.string().trim().min(1, 'Address is required'),
    postalCode: z.string().trim().min(1, 'Postal code is required'),
    city: z.string().trim().min(1, 'City is required'),
    country: z.string().trim().min(1, 'Country is required'),
    // overwrite normalizes "be 0123.456.789" to "BE0123456789" before the format check,
    // without changing the type (unlike transform, which would split input and output types).
    // superRefine, not refine: the message depends on the value (the user's country)
    vatNumber: z
        .string()
        .overwrite(normalizeVatNumber)
        .superRefine((value, ctx) => {
            const message = vatNumberError(value);
            if (message) ctx.addIssue({ code: 'custom', message });
        }),
});

export type CompanyFormValues = z.infer<typeof companySchema>;
