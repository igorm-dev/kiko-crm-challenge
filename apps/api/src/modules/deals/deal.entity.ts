import { DealStatus } from '@kiko/contracts';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Lead } from '../leads/lead.entity';
import { User } from '../users/user.entity';

@Entity('deals')
export class Deal {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Index('uq_deals_code', { unique: true })
    @Column({ type: 'varchar', length: 32 })
    code!: string;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @ManyToOne(() => Lead, { nullable: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'lead_id' })
    lead!: Lead;

    @Index('idx_deals_lead_id')
    @Column({ type: 'uuid' })
    leadId!: string;

    @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'seller_id' })
    seller!: User;

    @Index('idx_deals_seller_id')
    @Column({ type: 'uuid' })
    sellerId!: string;

    @Column({
        type: 'numeric',
        precision: 14,
        scale: 2,
        transformer: {
            to: (value: number) => value,
            from: (value: string | null) => (value === null ? null : Number(value)),
        },
    })
    estimatedValue!: number;

    @Column({ type: 'date', nullable: true })
    expectedCloseDate!: string | null;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Index('idx_deals_status')
    @Column({
        type: 'enum',
        enum: DealStatus,
        enumName: 'deal_status',
        default: DealStatus.New,
    })
    status!: DealStatus;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt!: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deletedAt!: Date | null;
}