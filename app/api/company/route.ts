import { NextResponse } from 'next/server';
import { companyStore } from '@/app/api/company/store';
import { companySchema } from '@/features/company/schema';
import { withErrorHandling } from '@/lib/with-error-handling';
import { parseBody } from '@/lib/parse-body';

export async function GET() {
    return NextResponse.json(companyStore.company);
}

export const PUT = withErrorHandling(async (request: Request) => {
    const data = await parseBody(request, companySchema);

    companyStore.company = data;

    return NextResponse.json(companyStore.company);
});
