import { useQuery } from '@tanstack/react-query';
import { getClients } from '@/features/clients/api';

export function useClients() {
    return useQuery({ queryKey: ['clients'], queryFn: getClients });
}
