import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationBell } from './NotificationBell';
import type { NewNotification } from '../types';
import { useNotificationStore } from '@/lib/store/useNotificationStore';

function push(notification: Partial<NewNotification> = {}) {
    return useNotificationStore
        .getState()
        .add({ type: 'info', title: 'Invoice updated', ...notification });
}

// Nothing fetched: no QueryClient needed, a plain render is enough
function renderBell() {
    const user = userEvent.setup();
    render(<NotificationBell />);
    return { user };
}

async function openPanel(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('button', { name: /^Notifications/ }));
    return screen.findByRole('dialog');
}

describe('NotificationBell', () => {
    it('shows the unread count on the bell, capped at 9+', () => {
        for (let i = 0; i < 12; i++) push();

        renderBell();

        const bell = screen.getByRole('button', { name: 'Notifications (12 unread)' });
        expect(bell).toHaveTextContent('9+');
    });

    it('shows an empty state when there is no notification', async () => {
        const { user } = renderBell();

        const panel = await openPanel(user);

        expect(within(panel).getByText('No notifications')).toBeInTheDocument();
    });

    it('clears the unread count when the user marks everything as read', async () => {
        push({ title: 'Invoice INV-001 marked as paid' });
        push({ title: 'Invoice INV-004 is overdue' });
        const { user } = renderBell();

        const panel = await openPanel(user);
        await user.click(within(panel).getByRole('button', { name: 'Mark all as read' }));

        expect(within(panel).getByText('All caught up')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Notifications' })).not.toHaveTextContent(
            /\d/,
        );
    });

    it('marks a notification as read when the user clicks it', async () => {
        push({ title: 'Invoice INV-001 marked as paid' });
        push({ title: 'Invoice INV-004 is overdue' });
        const { user } = renderBell();

        const panel = await openPanel(user);
        await user.click(within(panel).getByRole('button', { name: /INV-004 is overdue/ }));

        expect(within(panel).getByText('1 unread')).toBeInTheDocument();
    });

    it('links a notification to its page', async () => {
        push({ title: 'Invoice INV-001 marked as paid', href: '/invoices/INV-001' });
        const { user } = renderBell();

        const panel = await openPanel(user);

        expect(within(panel).getByRole('link', { name: /INV-001 marked as paid/ })).toHaveAttribute(
            'href',
            '/invoices/INV-001',
        );
    });

    it('removes a notification', async () => {
        push({ title: 'Invoice INV-004 is overdue' });
        const { user } = renderBell();

        const panel = await openPanel(user);
        await user.click(
            within(panel).getByRole('button', {
                name: 'Remove notification: Invoice INV-004 is overdue',
            }),
        );

        expect(within(panel).queryByText('Invoice INV-004 is overdue')).not.toBeInTheDocument();
        expect(within(panel).getByText('No notifications')).toBeInTheDocument();
    });
});
