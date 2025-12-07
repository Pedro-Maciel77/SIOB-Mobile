import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn,
  OneToMany
} from 'typeorm';
import { Occurrence } from './Occurrence';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  plate!: string;

  @Column()
  name!: string;

  @Column({ default: true })
  active!: boolean;

  @OneToMany(() => Occurrence, occurrence => occurrence.vehicle)
  occurrences!: Occurrence[];

  @CreateDateColumn()
  createdAt!: Date;

  constructor() {
    this.occurrences = [];
  }
}