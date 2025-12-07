import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn,
  ManyToOne
} from 'typeorm';
import { User } from './User';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, user => user.auditLogs)
  user!: User;

  @Column()
  action!: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'download';

  @Column()
  entity!: 'user' | 'occurrence' | 'report' | 'vehicle';

  @Column({ nullable: true })
  entityId?: string;

  @Column({ type: 'jsonb', nullable: true })
  details?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  changes?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;
}