import { clients as seedClients } from '@/features/clients/data';
import { Client } from '@/features/clients/types';

export const clientStore = { clients: [...seedClients] as Client[] };
