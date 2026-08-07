export enum UserRole {
    Admin = 'admin',
    Seller = 'seller',
}

export enum LeadSource {
    Inbound = 'inbound',
    Outbound = 'outbound',
    Referral = 'referral',
    Event = 'event',
    SocialMedia = 'social_media',
    Other = 'other',
}

export enum DealStatus {
    New = 'new',
    InProgress = 'in_progress',
    Won = 'won',
    Lost = 'lost',
}

/** Human-readable labels for the UI. Values stay in English in the database. */
export const USER_ROLE_LABELS: Record<UserRole, string> = {
    [UserRole.Admin]: 'Administrador',
    [UserRole.Seller]: 'Vendedor',
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
    [LeadSource.Inbound]: 'Inbound',
    [LeadSource.Outbound]: 'Outbound',
    [LeadSource.Referral]: 'Indicação',
    [LeadSource.Event]: 'Evento',
    [LeadSource.SocialMedia]: 'Redes sociais',
    [LeadSource.Other]: 'Outro',
};

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
    [DealStatus.New]: 'Novo',
    [DealStatus.InProgress]: 'Em andamento',
    [DealStatus.Won]: 'Ganho',
    [DealStatus.Lost]: 'Perdido',
};
