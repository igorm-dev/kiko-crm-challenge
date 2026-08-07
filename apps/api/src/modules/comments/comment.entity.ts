import {
    Check,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Deal } from '../deals/deal.entity';
import { Lead } from '../leads/lead.entity';
import { User } from '../users/user.entity';

@Entity('comments')
@Check('chk_comments_single_target', '("lead_id" IS NULL) <> ("deal_id" IS NULL)')
export class Comment {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'text' })
    content!: string;

    @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'author_id' })
    author!: User;

    @Column({ type: 'uuid' })
    authorId!: string;

    @ManyToOne(() => Lead, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'lead_id' })
    lead!: Lead | null;

    @Index('idx_comments_lead_id')
    @Column({ type: 'uuid', nullable: true })
    leadId!: string | null;

    @ManyToOne(() => Deal, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'deal_id' })
    deal!: Deal | null;

    @Index('idx_comments_deal_id')
    @Column({ type: 'uuid', nullable: true })
    dealId!: string | null;

    @Column({ type: 'boolean', default: false })
    isSystemEvent!: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deletedAt!: Date | null;
}
