import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn,
  OneToMany
} from 'typeorm';
import { Occurrence } from './Occurrence';

@Entity('municipalities')
export class Municipality {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @OneToMany(() => Occurrence, occurrence => occurrence.municipality)
  occurrences!: Occurrence[];

  @Column({ default: true })
  active!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  constructor() {
    this.occurrences = [];
  }
}