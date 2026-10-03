// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest';
import { GET, PUT } from './route';
import { profileStore } from './store';

function putRequest(body: unknown) {
    return new Request('http://localhost/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

const profile = { name: 'Ada Lovelace', email: 'ada@example.com', jobTitle: 'Accountant' };

describe('/api/profile', () => {
    beforeEach(() => {
        profileStore.profile = { ...profile };
    });

    it('returns the profile', async () => {
        const response = await GET();

        expect(await response.json()).toEqual(profile);
    });

    it('saves the new profile and returns it', async () => {
        const updated = { ...profile, name: 'Grace Hopper' };

        const response = await PUT(putRequest(updated));

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual(updated);
        expect(profileStore.profile).toEqual(updated);
    });

    it('rejects an invalid email with a 400 naming the field, and saves nothing', async () => {
        const response = await PUT(putRequest({ ...profile, email: 'not-an-email' }));

        expect(response.status).toBe(400);
        expect(await response.json()).toMatchObject({ field: 'email' });
        expect(profileStore.profile).toEqual(profile);
    });
});
