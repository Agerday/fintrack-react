import { http, HttpResponse } from 'msw';
import { profileSchema } from '@/features/profile/schema';
import type { Profile } from '@/features/profile/types';

const defaultProfile: Profile = {
    name: 'Test User',
    email: 'test.user@example.com',
    jobTitle: 'Accountant',
};

// Mirrors app/api/profile: same status codes and body shapes, validated with the same schema
export const profileDb = {
    profile: { ...defaultProfile },
    reset() {
        this.profile = { ...defaultProfile };
    },
};

export const profileHandlers = [
    http.get('/api/profile', () => HttpResponse.json(profileDb.profile)),

    http.put('/api/profile', async ({ request }) => {
        const result = profileSchema.safeParse(await request.json());
        if (!result.success) {
            const issue = result.error.issues[0];
            return HttpResponse.json(
                { message: issue.message, field: String(issue.path[0]) },
                { status: 400 },
            );
        }

        profileDb.profile = result.data;
        return HttpResponse.json(profileDb.profile);
    }),
];
