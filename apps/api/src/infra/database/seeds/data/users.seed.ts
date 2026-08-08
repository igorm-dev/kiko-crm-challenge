import { UserRole, type CreateUserInput } from '@kiko/contracts';

export const USER_SEEDS: CreateUserInput[] = [
    {
        name: 'Rodrigo Ramos',
        email: 'rodrigo.ramos@kikos.com.br',
        password: 'Senha1234;',
        role: UserRole.Admin,
        jobTitle: 'Head de Vendas',
    },
    {
        name: 'Marina Costa',
        email: 'marina.costa@kikos.com.br',
        password: 'Senha1234;',
        role: UserRole.Seller,
        jobTitle: 'Executiva de Contas',
    },
];
