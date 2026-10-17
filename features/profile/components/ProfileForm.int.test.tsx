import { afterEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { ProfileForm } from './ProfileForm';
import { profileStore } from '@/app/api/profile/store';
import { profileDb } from '@/test/msw/handlers/profile';
import { renderWithClient } from '@/test/render';

// Saving calls the real saveProfile Server Action, which writes the server store directly
const storedProfile = { ...profileStore.profile };

describe('ProfileForm', () => {
    afterEach(() => {
        profileStore.profile = { ...storedProfile };
    });

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
        expect(screen.getByLabelText('Name')).toHaveValue('Grace Hopper');
        expect(profileStore.profile.name).toBe('Grace Hopper');
    });

    it('shows the server validation error and keeps what the user typed', async () => {
        const { user } = renderWithClient(<ProfileForm />);
        const email = await screen.findByLabelText('Email');

        await user.clear(email);
        await user.type(email, 'not-an-email');
        await user.click(screen.getByRole('button', { name: 'Save changes' }));

        expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toHaveValue('not-an-email');
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
        expect(profileStore.profile).toEqual(storedProfile);
    });
});
