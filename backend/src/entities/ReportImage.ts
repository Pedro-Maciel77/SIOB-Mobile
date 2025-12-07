import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn,
  ManyToOne
} from 'typeorm';
import { Report } from './Report';

@Entity('report_images')
export class ReportImage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  filename!: string;

  @Column()
  path!: string;

  @ManyToOne(() => Report, report => report.images)
  report!: Report;

  @CreateDateColumn()
  createdAt!: Date;
}