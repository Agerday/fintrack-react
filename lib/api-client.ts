import { ApiError, mapStatusToErrorCode } from '@/lib/api-error';

export async function apiClient<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`/api${path}`, init);
    if (!response.ok) {
        throw new ApiError(response.status, mapStatusToErrorCode(response.status));
    }
    return response.json() as Promise<T>;
}
