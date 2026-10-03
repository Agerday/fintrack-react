import { NextResponse } from 'next/server';
import { profileStore } from '@/app/api/profile/store';
import { profileSchema } from '@/features/profile/schema';
import { withErrorHandling } from '@/lib/with-error-handling';
import { parseBody } from '@/lib/parse-body';

export async function GET() {
    return NextResponse.json(profileStore.profile);
}

export const PUT = withErrorHandling(async (request: Request) => {
    const data = await parseBody(request, profileSchema);

    profileStore.profile = data;

    return NextResponse.json(profileStore.profile);
});
