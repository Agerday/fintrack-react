import { z } from 'zod';

export const clientSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.email('Enter a valid email address'),
    phone: z.string().min(8, 'Enter a valid phone number'),
    company: z.string().min(1, 'Company is required'),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
