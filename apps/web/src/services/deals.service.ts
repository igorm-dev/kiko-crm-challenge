import {
    CommentListSchema,
    CommentSchema,
    DealBoardSchema,
    PaginatedDealsSchema,
    DealSchema,
    type Comment,
    type CreateDealInput,
    type Deal,
    type DealBoard,
    type DealListQuery,
    type DealStatus,
    type PaginatedDeals,
} from '@kiko/contracts';
import { apiFetch, apiMutate } from './api';

export function getBoard(): Promise<DealBoard> {
    return apiFetch('/deals/board', DealBoardSchema);
}

export function listDeals(query: Partial<DealListQuery>): Promise<PaginatedDeals> {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== '') {
            params.set(key, String(value));
        }
    }

    return apiFetch(`/deals?${params.toString()}`, PaginatedDealsSchema);
}

export function getDeal(id: string): Promise<Deal> {
    return apiFetch(`/deals/${id}`, DealSchema);
}

export function createDeal(input: CreateDealInput): Promise<Deal> {
    return apiMutate('/deals', DealSchema, 'POST', input);
}

export function moveDeal(id: string, status: DealStatus): Promise<Deal> {
    return apiMutate(`/deals/${id}/move`, DealSchema, 'POST', { status });
}

export function listComments(dealId: string): Promise<Comment[]> {
    return apiFetch(`/deals/${dealId}/comments`, CommentListSchema);
}

export function createComment(dealId: string, content: string): Promise<Comment> {
    return apiMutate(`/deals/${dealId}/comments`, CommentSchema, 'POST', { content });
}
