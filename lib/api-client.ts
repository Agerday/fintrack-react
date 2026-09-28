import { ApiError, mapStatusToErrorCode } from '@/lib/api-error';
import { TAB_ID, TAB_ID_HEADER } from '@/lib/realtime';

export async function apiClient<T>(path: string, init?: RequestInit): Promise<T> {
    // Like an Angular HttpInterceptor adding a header: tags the request with this tab's id
    const headers = new Headers(init?.headers);
    headers.set(TAB_ID_HEADER, TAB_ID);

    const response = await fetch(`/api${path}`, { ...init, headers });
    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        // gives the field in error to add it in custom error message
        throw new ApiError(
            response.status,
            mapStatusToErrorCode(response.status),
            body.field,
            body.message,
        );
    }
    return response.json() as Promise<T>;
}
