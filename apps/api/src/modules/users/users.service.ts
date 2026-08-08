import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash } from 'bcryptjs';
import type { CreateUserInput, UpdateUserInput } from '@kiko/contracts';
import { User } from './user.entity';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    findAll(): Promise<User[]> {
        return this.usersRepository.find({ order: { name: 'ASC' } });
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
                createdAt: true,
                passwordHash: true,
            },
        });
    }

    async create(input: CreateUserInput): Promise<User> {
        await this.assertEmailIsFree(input.email);

        const { password, ...rest } = input;
        const user = this.usersRepository.create({
            ...rest,
            passwordHash: await hash(password, BCRYPT_ROUNDS),
        });

        const saved = await this.usersRepository.save(user);

        return this.findById(saved.id);
    }

    async update(id: string, input: UpdateUserInput): Promise<User> {
        const user = await this.findById(id);

        if (input.email && input.email !== user.email) {
            await this.assertEmailIsFree(input.email);
        }

        const { password, ...rest } = input;
        await this.usersRepository.update(id, {
            ...rest,
            ...(password ? { passwordHash: await hash(password, BCRYPT_ROUNDS) } : {}),
        });

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
