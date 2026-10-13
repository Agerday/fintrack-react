import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationSettings } from './NotificationSettings';

describe('NotificationSettings', () => {
    it('turns only the clicked alert off', async () => {
        const user = userEvent.setup();
        render(<NotificationSettings />);

        await user.click(screen.getByRole('switch', { name: 'Invoice updated' }));

        expect(screen.getByRole('switch', { name: 'Invoice updated' })).not.toBeChecked();
        expect(screen.getByRole('switch', { name: 'Invoice created' })).toBeChecked();
    });
});
