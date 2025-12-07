import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Occurrence } from './Occurrence';
import { AuditLog } from './AuditLog';
import { Report } from './Report';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ unique: true, length: 100 })
  email!: string;

  @Column()
  password!: string;

  @Column({ nullable: true, length: 20 })
  registration?: string;

  @Column({ nullable: true, length: 50 })
  unit?: string;

  @Column({ 
    type: 'varchar', 
    length: 20,
    default: 'user' 
  })
  role!: 'admin' | 'supervisor' | 'user' | 'operator';

  @OneToMany(() => Occurrence, occurrence => occurrence.createdBy)
  occurrences!: Occurrence[];

  @OneToMany(() => Report, report => report.createdBy)
  reports!: Report[];

  @OneToMany(() => AuditLog, auditLog => auditLog.user)
  auditLogs!: AuditLog[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor() {
    this.occurrences = [];
    this.reports = [];
    this.auditLogs = [];
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}