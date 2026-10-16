import { sharedStore } from '@/lib/shared-store';
import { clients as seedClients } from '@/features/clients/data';
import type { ClientRecord } from '@/features/clients/types';

export const clientStore = sharedStore('clients', () => ({
    clients: [...seedClients] as ClientRecord[],
}));
