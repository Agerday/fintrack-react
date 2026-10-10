import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { CompanyForm } from './CompanyForm';
import { server } from '@/test/msw/server';
import { companyDb } from '@/test/msw/handlers/company';
import { renderWithClient } from '@/test/render';

describe('CompanyForm', () => {
    it('loads the current company into the form', async () => {
        companyDb.company = { ...companyDb.company, name: 'Acme', vatNumber: 'FR12345678901' };

        renderWithClient(<CompanyForm />);

        expect(await screen.findByLabelText('Company name')).toHaveValue('Acme');
        expect(screen.getByLabelText('VAT number')).toHaveValue('FR12345678901');
    });

    it('saves the edited company and confirms it', async () => {
        const { user } = renderWithClient(<CompanyForm />);
        const city = await screen.findByLabelText('City');

        await user.clear(city);
        await user.type(city, 'Ghent');
        await user.click(screen.getByRole('button', { name: 'Save changes' }));

        expect(await screen.findByRole('status')).toHaveTextContent('Company saved');
        expect(companyDb.company.city).toBe('Ghent');
    });

    it('shows a server validation error under the matching field', async () => {
        server.use(
            http.put('/api/company', () =>
                HttpResponse.json(
                    { message: 'This VAT number is not registered', field: 'vatNumber' },
                    { status: 400 },
                ),
            ),
        );
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const { user } = renderWithClient(<CompanyForm />);
        const vat = await screen.findByLabelText('VAT number');

        await user.clear(vat);
        await user.type(vat, 'BE9999999999');
        await user.click(screen.getByRole('button', { name: 'Save changes' }));

        expect(await screen.findByText('This VAT number is not registered')).toBeInTheDocument();
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
});
