import { clients as seedClients } from '@/features/clients/data';
import type { ClientRecord } from '@/features/clients/types';

export const clientStore = { clients: [...seedClients] as ClientRecord[] };
