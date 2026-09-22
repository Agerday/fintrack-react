export async function apiClient<T>(path: string): Promise<T> {
    const response = await fetch(`/api${path}`);
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.json() as Promise<T>;
}
