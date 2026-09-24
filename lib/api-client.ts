import { ApiError, mapStatusToErrorCode } from '@/lib/api-error';

export async function apiClient<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`/api${path}`, init);
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
