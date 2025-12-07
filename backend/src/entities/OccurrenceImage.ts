import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn,
  ManyToOne
} from 'typeorm';
import { Occurrence } from './Occurrence';

@Entity('occurrence_images')
export class OccurrenceImage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  filename!: string;

  @Column()
  path!: string;

  @ManyToOne(() => Occurrence, occurrence => occurrence.images)
  occurrence!: Occurrence;

  @CreateDateColumn()
  createdAt!: Date;
}