import { describe, expect, it } from 'vitest';
import { createClient, emailExists } from './rules';
import { buildClient } from '@/test/factories';

describe('emailExists', () => {
    it('finds an email whatever its case', () => {
        const clients = [buildClient({ email: 'john@acme.com' })];

        expect(emailExists(clients, 'John@ACME.com')).toBe(true);
    });

    it('returns false for an unknown email', () => {
        const clients = [buildClient({ email: 'john@acme.com' })];

        expect(emailExists(clients, 'jane@acme.com')).toBe(false);
    });
});

describe('createClient', () => {
    it('prefixes the phone with the dial code of the country', () => {
        const client = createClient(
            {
                name: 'John',
                email: 'john@acme.com',
                countryCode: 'BE',
                phone: '470123456',
                company: 'Acme',
            },
            new Date(),
        );

        expect(client.phone).toBe('+32 470123456');
    });
});
