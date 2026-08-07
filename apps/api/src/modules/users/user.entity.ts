import { UserRole } from '@kiko/contracts';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Index('uq_users_email', { unique: true, where: '"deleted_at" IS NULL' })
    @Column({ type: 'varchar', length: 255 })
    email!: string;

    @Column({ type: 'varchar', length: 255, select: false })
    passwordHash!: string;

    @Column({ type: 'enum', enum: UserRole, enumName: 'user_role' })
    role!: UserRole;

    @Column({ type: 'varchar', length: 255 })
    jobTitle!: string;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deletedAt!: Date | null;
}