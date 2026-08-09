import { UserRole, type CreateUserInput } from '@kiko/contracts';

export type UserSeed = CreateUserInput & { password: string };

export const USER_SEEDS: UserSeed[] = [
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
