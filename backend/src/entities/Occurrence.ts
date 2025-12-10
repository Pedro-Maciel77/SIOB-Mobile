import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  OneToMany
} from 'typeorm';
import { User } from './User';
import { Vehicle } from './Vehicle';
import { Report } from './Report';
import { OccurrenceImage } from './OccurrenceImage';

@Entity('occurrences')
export class Occurrence {
  @PrimaryGeneratedColumn('uuid')
  id!: string; // Adicionado "!" para indicar inicialização definida

  @Column({ 
    type: 'varchar', 
    length: 50 
  })
  type!: 'acidente' | 'resgate' | 'incendio' | 'atropelamento' | 'outros';

  @Column({ length: 100 })
  municipality!: string;

  @Column({ length: 100, nullable: true })
  neighborhood?: string;

  @Column({ type: 'text' })
  address!: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @Column({ type: 'timestamp' })
  occurrenceDate!: Date;

  @Column({ type: 'timestamp' })
  activationDate!: Date;

  @Column({ 
    type: 'varchar', 
    length: 20,
    default: 'aberto' 
  })
  status!: 'aberto' | 'em_andamento' | 'finalizado' | 'alerta';

  @Column({ length: 100, nullable: true })
  victimName?: string;

  @Column({ length: 20, nullable: true })
  victimContact?: string;

  @ManyToOne(() => Vehicle, vehicle => vehicle.occurrences, { nullable: true })
  vehicle?: Vehicle;

  @Column({ length: 20, nullable: true })
  vehicleNumber?: string;

  @Column({ type: 'text' })
  description!: string;

  @ManyToOne(() => User, user => user.occurrences)
  createdBy!: User;

  @OneToMany(() => Report, report => report.occurrence)
  reports!: Report[];

  @OneToMany(() => OccurrenceImage, image => image.occurrence)
  images!: OccurrenceImage[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

}