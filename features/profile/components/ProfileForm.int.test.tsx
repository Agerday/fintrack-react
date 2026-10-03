import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { ProfileForm } from './ProfileForm';
import { server } from '@/test/msw/server';
import { profileDb } from '@/test/msw/handlers/profile';
import { renderWithClient } from '@/test/render';

describe('ProfileForm', () => {
    it('loads the current profile into the form', async () => {
        profileDb.profile = { name: 'Ada Lovelace', email: 'ada@example.com', jobTitle: 'CFO' };

        renderWithClient(<ProfileForm />);

        expect(await screen.findByLabelText('Name')).toHaveValue('Ada Lovelace');
        expect(screen.getByLabelText('Email')).toHaveValue('ada@example.com');
        expect(screen.getByLabelText('Job title')).toHaveValue('CFO');
    });

    it('saves the edited profile and confirms it', async () => {
        const { user } = renderWithClient(<ProfileForm />);
        const name = await screen.findByLabelText('Name');

        await user.clear(name);
        await user.type(name, 'Grace Hopper');
        await user.click(screen.getByRole('button', { name: 'Save changes' }));

        expect(await screen.findByRole('status')).toHaveTextContent('Profile saved');
        expect(profileDb.profile.name).toBe('Grace Hopper');
    });

    it('shows a server validation error under the matching field', async () => {
        server.use(
            http.put('/api/profile', () =>
                HttpResponse.json(
                    { message: 'This domain is not allowed', field: 'email' },
                    { status: 400 },
                ),
            ),
        );
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const { user } = renderWithClient(<ProfileForm />);
        const email = await screen.findByLabelText('Email');

        await user.clear(email);
        await user.type(email, 'taken@example.com');
        await user.click(screen.getByRole('button', { name: 'Save changes' }));

        expect(await screen.findByText('This domain is not allowed')).toBeInTheDocument();
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
});
