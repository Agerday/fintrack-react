'use server';

import { z } from 'zod';
import { profileStore } from '@/app/api/profile/store';
import { profileSchema, type ProfileFormValues } from './schema';

export type SaveProfileState = {
    status: 'idle' | 'success' | 'error';
    // What the fields show after a submit: the saved profile, or the rejected input as typed
    values: ProfileFormValues;
    fieldErrors?: Partial<Record<keyof ProfileFormValues, string[]>>;
};

// Server Action twin of PUT /api/profile, for useActionState: React posts the form to the server,
// no fetch, no API client. Same schema as the Route Handler. Validation errors are returned as
// state, not thrown: a throw would hit the error boundary instead of showing under the field
export async function saveProfile(
    _previous: SaveProfileState,
    formData: FormData,
): Promise<SaveProfileState> {
    const values = {
        name: String(formData.get('name') ?? ''),
        email: String(formData.get('email') ?? ''),
        jobTitle: String(formData.get('jobTitle') ?? ''),
    };
    const result = profileSchema.safeParse(values);
    if (!result.success) {
        return { status: 'error', values, fieldErrors: z.flattenError(result.error).fieldErrors };
    }

    profileStore.profile = result.data;
    return { status: 'success', values: result.data };
}
