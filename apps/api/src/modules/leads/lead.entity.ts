import { LeadSource } from '@kiko/contracts';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('leads')
export class Lead {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'varchar', length: 255 })
    companyName!: string;

    @Column({ type: 'varchar', length: 255 })
    roleTitle!: string;

    @Column({ type: 'enum', enum: LeadSource, enumName: 'lead_source' })
    source!: LeadSource;

    @Column({ type: 'varchar', length: 255 })
    email!: string;

    @Column({ type: 'varchar', length: 32 })
    phone!: string;

    @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'seller_id' })
    seller!: User;

    @Index('idx_leads_seller_id')
    @Column({ type: 'uuid' })
    sellerId!: string;

    @Column({ type: 'text', nullable: true })
    observation!: string | null;

    @Column({ type: 'timestamptz', nullable: true })
    lastInteraction!: Date | null;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deletedAt!: Date | null;
}
