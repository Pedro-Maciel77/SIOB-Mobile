import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn,
  ManyToOne,
  OneToMany
} from 'typeorm';
import { Occurrence } from './Occurrence';
import { User } from './User';
import { ReportImage } from './ReportImage';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  content!: string;

  @ManyToOne(() => Occurrence, occurrence => occurrence.reports)
  occurrence!: Occurrence;

  @ManyToOne(() => User, user => user.reports)
  createdBy!: User;

  @OneToMany(() => ReportImage, image => image.report)
  images!: ReportImage[];

  @CreateDateColumn()
  createdAt!: Date;

  constructor() {
    this.images = [];
  }
}