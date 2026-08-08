import {
    LeadSchema,
    PaginatedLeadsSchema,
    type CreateLeadInput,
    type Lead,
    type LeadListQuery,
    type PaginatedLeads,
    type UpdateLeadInput,
} from '@kiko/contracts';
import { apiFetch, apiMutate } from './api';

export function listLeads(query: Partial<LeadListQuery>): Promise<PaginatedLeads> {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== '') {
            params.set(key, String(value));
        }
    }

    return apiFetch(`/leads?${params.toString()}`, PaginatedLeadsSchema);
}

export function getLead(id: string): Promise<Lead> {
    return apiFetch(`/leads/${id}`, LeadSchema);
}

export function createLead(input: CreateLeadInput): Promise<Lead> {
    return apiMutate('/leads', LeadSchema, 'POST', input);
}

export function updateLead(id: string, input: UpdateLeadInput): Promise<Lead> {
    return apiMutate(`/leads/${id}`, LeadSchema, 'PATCH', input);
}

export function archiveLead(id: string): Promise<Lead> {
    return apiMutate(`/leads/${id}/archive`, LeadSchema, 'POST');
}

export function unarchiveLead(id: string): Promise<Lead> {
    return apiMutate(`/leads/${id}/unarchive`, LeadSchema, 'POST');
}
