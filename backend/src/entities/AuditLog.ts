import { 
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { User } from './User';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, user => user.auditLogs)
  @JoinColumn({ name: 'user_id' }) // ✅ AQUI
  user!: User;

  @Column()
  action!: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'download';

  @Column()
  entity!: 'user' | 'occurrence' | 'report' | 'vehicle';

  @Column({ name: 'entity_id', nullable: true })
  entityId?: string;

  @Column({ type: 'jsonb', nullable: true })
  details?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
