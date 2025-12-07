import { FindManyOptions, FindOptionsWhere } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Occurrence } from '../entities/Occurrence';
import { BaseRepository } from './BaseRepository';

export interface OccurrenceFilters {
  type?: string;
  status?: string;
  municipality?: string;
  neighborhood?: string;
  startDate?: Date;
  endDate?: Date;
  createdBy?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export type OccurrenceStatus = 'aberto' | 'em_andamento' | 'finalizado' | 'alerta';

export class OccurrenceRepository extends BaseRepository<Occurrence> {
  constructor() {
    super(Occurrence);
  }

  async findWithFilters(filters: OccurrenceFilters): Promise<{ 
    occurrences: Occurrence[]; 
    total: number;
    counts: {
      total: number;
      aberto: number;
      em_andamento: number;
      finalizado: number;
      alerta: number;
    }
  }> {
    const {
      type,
      status,
      municipality,
      neighborhood,
      startDate,
      endDate,
      createdBy,
      search,
      page = 1,
      limit = 20
    } = filters;

    const query = this.repository.createQueryBuilder('occurrence')
      .leftJoinAndSelect('occurrence.createdBy', 'user')
      .leftJoinAndSelect('occurrence.vehicle', 'vehicle')
      .leftJoinAndSelect('occurrence.images', 'images');

    // Aplicar filtros
    if (type) {
      query.andWhere('occurrence.type = :type', { type });
    }

    if (status) {
      query.andWhere('occurrence.status = :status', { status });
    }

    if (municipality) {
      query.andWhere('occurrence.municipality ILIKE :municipality', { 
        municipality: `%${municipality}%` 
      });
    }

    if (neighborhood) {
      query.andWhere('occurrence.neighborhood ILIKE :neighborhood', { 
        neighborhood: `%${neighborhood}%` 
      });
    }

    if (startDate && endDate) {
      query.andWhere('occurrence.occurrenceDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      });
    }

    if (createdBy) {
      query.andWhere('occurrence.createdBy = :createdBy', { createdBy });
    }

    if (search) {
      query.andWhere(
        '(occurrence.address ILIKE :search OR occurrence.description ILIKE :search OR occurrence.victimName ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Paginação
    const skip = (page - 1) * limit;
    const [occurrences, total] = await query
      .skip(skip)
      .take(limit)
      .orderBy('occurrence.occurrenceDate', 'DESC')
      .getManyAndCount();

    // Contagens por status
    const counts = await this.getStatusCounts(filters);

    return { 
      occurrences, 
      total,
      counts
    };
  }

  async getStatusCounts(filters?: Partial<OccurrenceFilters>): Promise<{
    total: number;
    aberto: number;
    em_andamento: number;
    finalizado: number;
    alerta: number;
  }> {
    const query = this.repository.createQueryBuilder('occurrence')
      .select('occurrence.status, COUNT(*) as count');

    // Aplicar mesmos filtros
    if (filters?.municipality) {
      query.andWhere('occurrence.municipality = :municipality', { 
        municipality: filters.municipality 
      });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('occurrence.occurrenceDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate
      });
    }

    const result = await query
      .groupBy('occurrence.status')
      .getRawMany();

    // Inicializa o objeto de contagens
    const counts: {
      total: number;
      aberto: number;
      em_andamento: number;
      finalizado: number;
      alerta: number;
    } = {
      total: 0,
      aberto: 0,
      em_andamento: 0,
      finalizado: 0,
      alerta: 0
    };

    // Preenche as contagens de forma type-safe
    result.forEach(item => {
      const status = item.occurrence_status as OccurrenceStatus;
      const count = parseInt(item.count);
      
      // Verifica se a chave existe no objeto
      if (status in counts) {
        counts[status] = count;
        counts.total += count;
      }
    });

    return counts;
  }

  async findByVehicle(vehicleId: string): Promise<Occurrence[]> {
    return await this.repository.find({
      where: { vehicle: { id: vehicleId } } as FindOptionsWhere<Occurrence>,
      relations: ['createdBy', 'vehicle'],
      order: { occurrenceDate: 'DESC' }
    });
  }

  async findByUser(userId: string): Promise<Occurrence[]> {
    return await this.repository.find({
      where: { createdBy: { id: userId } } as FindOptionsWhere<Occurrence>,
      relations: ['vehicle', 'images'],
      order: { occurrenceDate: 'DESC' }
    });
  }

  async getMunicipalityStats(): Promise<Array<{municipality: string, count: number}>> {
    const result = await this.repository
      .createQueryBuilder('occurrence')
      .select('occurrence.municipality, COUNT(*) as count')
      .groupBy('occurrence.municipality')
      .orderBy('count', 'DESC')
      .getRawMany();

    return result.map(item => ({
      municipality: item.occurrence_municipality,
      count: parseInt(item.count)
    }));
  }

  async getMonthlyStats(year: number): Promise<Array<{month: number, count: number}>> {
    const result = await this.repository
      .createQueryBuilder('occurrence')
      .select('EXTRACT(MONTH FROM occurrence.occurrenceDate) as month, COUNT(*) as count')
      .where('EXTRACT(YEAR FROM occurrence.occurrenceDate) = :year', { year })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    return result.map(item => ({
      month: parseInt(item.month),
      count: parseInt(item.count)
    }));
  }

  async updateStatus(occurrenceId: string, status: OccurrenceStatus): Promise<Occurrence | null> {
    await this.repository.update(occurrenceId, { status });
    return await this.findById(occurrenceId);
  }
}