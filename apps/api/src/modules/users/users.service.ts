import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { hash } from 'bcryptjs';
import type { CreateUserInput, Paginated, UpdateUserInput, UserListQuery } from '@kiko/contracts';
import { generatePassword } from './password.generator';
import { User } from './user.entity';

const BCRYPT_ROUNDS = 12;

export interface UserWithPassword {
    user: User;
    generatedPassword: string;
}

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    async findAll({ page, pageSize, search, role, view }: UserListQuery): Promise<Paginated<User>> {
        const query = this.usersRepository
            .createQueryBuilder('user')
            .orderBy('user.name', 'ASC')
            .skip((page - 1) * pageSize)
            .take(pageSize);

        if (role) {
            query.andWhere('user.role = :role', { role });
        }

        if (view === 'active') {
            query.andWhere('user.disabledAt IS NULL');
        }

        if (view === 'disabled') {
            query.andWhere('user.disabledAt IS NOT NULL');
        }

        if (search) {
            query.andWhere(
                new Brackets((where) => {
                    where.where('user.name ILIKE :search').orWhere('user.email ILIKE :search');
                }),
                { search: `%${search}%` },
            );
        }

        const [items, total] = await query.getManyAndCount();

        return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
    }

    async findById(id: string): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException('Usuário não encontrado.');
        }

        return user;
    }

    findByEmailWithPassword(email: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { email: email.toLowerCase() },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                jobTitle: true,
                disabledAt: true,
                createdAt: true,
                passwordHash: true,
            },
        });
    }

    async create(input: CreateUserInput): Promise<UserWithPassword> {
        await this.assertEmailIsFree(input.email);

        const generatedPassword = generatePassword();
        const saved = await this.usersRepository.save(
            this.usersRepository.create({
                ...input,
                passwordHash: await hash(generatedPassword, BCRYPT_ROUNDS),
            }),
        );

        return { user: await this.findById(saved.id), generatedPassword };
    }

    async update(id: string, input: UpdateUserInput): Promise<User> {
        const user = await this.findById(id);

        if (input.email && input.email !== user.email) {
            await this.assertEmailIsFree(input.email);
        }

        await this.usersRepository.update(id, input);

        return this.findById(id);
    }

    async resetPassword(id: string): Promise<UserWithPassword> {
        await this.findById(id);

        const generatedPassword = generatePassword();
        await this.usersRepository.update(id, {
            passwordHash: await hash(generatedPassword, BCRYPT_ROUNDS),
        });

        return { user: await this.findById(id), generatedPassword };
    }

    async disable(id: string): Promise<User> {
        const user = await this.findById(id);

        if (user.disabledAt) {
            throw new ConflictException('Este usuário já está desabilitado.');
        }

        await this.usersRepository.update(id, { disabledAt: new Date() });

        return this.findById(id);
    }

    async enable(id: string): Promise<User> {
        const user = await this.findById(id);

        if (!user.disabledAt) {
            throw new ConflictException('Este usuário já está habilitado.');
        }

        await this.usersRepository.update(id, { disabledAt: null });

        return this.findById(id);
    }

    async remove(id: string): Promise<void> {
        await this.findById(id);
        await this.usersRepository.softDelete(id);
    }

    private async assertEmailIsFree(email: string): Promise<void> {
        const existing = await this.usersRepository.findOne({
            where: { email: email.toLowerCase() },
        });

        if (existing) {
            throw new ConflictException('Já existe um usuário com este e-mail.');
        }
    }
}
