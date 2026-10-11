import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { ClientForm } from './ClientForm';
import { clientDb } from '@/test/msw/handlers/clients';
import { buildClient } from '@/test/factories';
import { renderWithClient } from '@/test/render';

describe('ClientForm', () => {
    it('creates a client whose new email replaced a taken one, without waiting for the check', async () => {
        clientDb.clients = [buildClient({ email: 'taken@acme.com' })];
        const onSuccess = vi.fn();
        const { user } = renderWithClient(<ClientForm onSuccess={onSuccess} />);
        await user.type(screen.getByLabelText('Name'), 'Jane Doe');
        await user.type(screen.getByLabelText('Phone number'), '470123456');
        await user.clear(screen.getByLabelText('Company'));
        await user.type(screen.getByLabelText('Company'), 'Acme');
        await user.type(screen.getByLabelText('Email'), 'taken@acme.com');
        expect(await screen.findByText('This email is already registered.')).toBeInTheDocument();

        await user.clear(screen.getByLabelText('Email'));
        await user.type(screen.getByLabelText('Email'), 'jane@acme.com');
        await user.click(screen.getByRole('button', { name: 'Create client' }));

        await waitFor(() => expect(onSuccess).toHaveBeenCalled());
        expect(clientDb.clients).toContainEqual(
            expect.objectContaining({ email: 'jane@acme.com' }),
        );
    });
});
