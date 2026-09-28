import { describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { z } from 'zod';
import { parseEvent, publishEvent, TAB_ID_HEADER } from './realtime';
import { server } from '@/test/msw/server';

const PUBLISH_URL = 'http://localhost:3001/publish';

describe('parseEvent', () => {
    const schema = z.object({ type: z.string(), id: z.string() });

    it('returns null instead of throwing on a message that is not JSON', () => {
        expect(parseEvent('not json {', schema)).toBeNull();
    });

    it('returns null on JSON that does not match the schema', () => {
        expect(parseEvent('{"type":"invoice.created"}', schema)).toBeNull();
    });
});

describe('publishEvent', () => {
    it('tags the event with the tab id of the request, so that tab can skip its own echo', async () => {
        let published: unknown;
        server.use(
            http.post(PUBLISH_URL, async ({ request }) => {
                published = await request.json();
                return new HttpResponse(null, { status: 204 });
            }),
        );
        const request = new Request('http://localhost/api/invoices', {
            headers: { [TAB_ID_HEADER]: 'tab-42' },
        });

        await publishEvent(request, { type: 'invoice.updated', id: 'INV-001' });

        expect(published).toEqual({ type: 'invoice.updated', id: 'INV-001', sourceId: 'tab-42' });
    });

    it('resolves without throwing when the socket server is down', async () => {
        server.use(http.post(PUBLISH_URL, () => HttpResponse.error()));
        vi.spyOn(console, 'warn').mockImplementation(() => {});

        await expect(
            publishEvent(new Request('http://localhost'), { type: 'invoice.created', id: '1' }),
        ).resolves.toBeUndefined();
    });
});
