// First component test: render it into jsdom (a fake DOM in Node), then query the DOM the
// way a user would see it.
//
// Testing Library's philosophy: test what the user sees (text, roles, labels), never the
// implementation (CSS classes, state, props). Refactoring the component should not break it.
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';

describe('InvoiceStatusBadge', () => {
    it.each([
        { status: 'paid', label: 'Paid' },
        { status: 'pending', label: 'Pending' },
        { status: 'overdue', label: 'Overdue' },
    ] as const)('shows "$label" for the $status status', ({ status, label }) => {
        render(<InvoiceStatusBadge status={status} />);

        // screen = the whole rendered document. getBy* throws if the element is missing,
        // so the query itself is already an assertion; toBeInTheDocument makes it explicit
        expect(screen.getByText(label)).toBeInTheDocument();
    });
});
