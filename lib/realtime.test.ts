import { afterEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { z } from 'zod';
import { parseEvent, publishEvent, TAB_ID_HEADER } from './realtime';
import { server } from '@/test-utils/msw';

describe('parseEvent', () => {
    const schema = z.object({ type: z.string(), id: z.string() });

    it('returns the parsed event when the JSON matches the schema', () => {
        expect(parseEvent('{"type":"invoice.created","id":"INV-1"}', schema)).toEqual({
            type: 'invoice.created',
            id: 'INV-1',
        });
    });

    it('returns null for invalid JSON instead of throwing', () => {
        expect(parseEvent('not json {', schema)).toBeNull();
    });

    it('returns null for valid JSON that does not match the schema', () => {
        expect(parseEvent('{"type":"invoice.created"}', schema)).toBeNull();
    });
});

describe('publishEvent', () => {
    // vi.spyOn replaces a method and records its calls (Jasmine: spyOn(...).and.callFake).
    // restoreAllMocks puts the original methods back after each test
    afterEach(() => vi.restoreAllMocks());

    it('posts the event to the socket server, tagged with the tab id of the request', async () => {
        // Capture what publishEvent sends by overriding the handler for this test only
        let receivedBody: unknown;
        server.use(
            http.post('http://localhost:3001/publish', async ({ request }) => {
                receivedBody = await request.json();
                return new HttpResponse(null, { status: 204 });
            }),
        );
        const request = new Request('http://localhost/api/invoices', {
            headers: { [TAB_ID_HEADER]: 'tab-42' },
        });

        await publishEvent(request, { type: 'invoice.updated', id: 'INV-001' });

        expect(receivedBody).toEqual({
            type: 'invoice.updated',
            id: 'INV-001',
            sourceId: 'tab-42',
        });
    });

    it('never throws when the socket server is down', async () => {
        // HttpResponse.error() simulates a network failure (server down, connection refused)
        server.use(http.post('http://localhost:3001/publish', () => HttpResponse.error()));
        // mockImplementation(() => {}) also silences the expected warning in the test output
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        // resolves = the promise fulfills (does not reject)
        await expect(
            publishEvent(new Request('http://localhost'), { type: 'invoice.created', id: '1' }),
        ).resolves.toBeUndefined();
        expect(warn).toHaveBeenCalledOnce();
    });
});
