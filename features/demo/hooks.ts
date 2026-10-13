import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resetDemoData } from './api';

export function useResetDemoData() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: resetDemoData,
        // Every resource changed: invalidate the whole cache rather than listing each key
        onSuccess: () => {
            void queryClient.invalidateQueries();
        },
        onError: (error) => {
            console.error('Failed to reset demo data:', error);
        },
    });
}
