import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { CreateUserSchema } from '@kiko/contracts';
import { User } from '../../../modules/users/user.entity';
import dataSource from '../data-source';
import { USER_SEEDS } from './data/users.seed';

loadEnv();

const BCRYPT_ROUNDS = 12;

async function seedUsers(): Promise<void> {
    const users = dataSource.getRepository(User);

    const seeds = z.array(CreateUserSchema).parse(USER_SEEDS);

    for (const { password, ...account } of seeds) {
        const existing = await users.findOne({ where: { email: account.email } });

        if (existing) {
            console.log(`- ${account.email} já existe, ignorado`);
            continue;
        }

        await users.save(
            users.create({ ...account, passwordHash: await hash(password, BCRYPT_ROUNDS) }),
        );
        console.log(`+ ${account.email} criado (${account.role})`);
    }
}

async function seed(): Promise<void> {
    await dataSource.initialize();

    try {
        await seedUsers();
    } finally {
        await dataSource.destroy();
    }
}

seed()
    .then(() => console.log('\nSeed concluído.'))
    .catch((error: unknown) => {
        console.error('\nSeed falhou:', error instanceof Error ? error.message : error);
        process.exit(1);
    });
