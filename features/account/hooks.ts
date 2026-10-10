import { useQuery } from '@tanstack/react-query';
import { getAccount } from './api';

// Read-only: transactions are written by the API itself (e.g. when an invoice is paid)
export function useAccount() {
    return useQuery({ queryKey: ['account'], queryFn: getAccount });
}
