// ./src/repositories/OccurrenceRepository.ts - VERSÃO CORRIGIDA
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
    const query = this.repository.createQueryBuilder('occurrence');

    // Aplicar filtros
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

    // PRIMEIRO: Contagem TOTAL
    const totalCount = await query.getCount();

    // SEGUNDO: Contagem por status com COALESCE para tratar NULLs
    const statusCounts = await query
      .select("COALESCE(occurrence.status, 'aberto') as status, COUNT(*) as count")
      .groupBy("COALESCE(occurrence.status, 'aberto')")
      .getRawMany();

    // Inicializa com zeros
    const counts = {
      total: totalCount,
      aberto: 0,
      em_andamento: 0,
      finalizado: 0,
      alerta: 0
    };

    // Preenche os status encontrados
    statusCounts.forEach(item => {
      const status = item.status as OccurrenceStatus;
      const count = parseInt(item.count);
      
      if (status in counts) {
        counts[status] = count;
      }
    });

    return counts;
  }

  async getTypeCounts(filters?: Partial<OccurrenceFilters>): Promise<Record<string, number>> {
    const query = this.repository.createQueryBuilder('occurrence')
      .select("COALESCE(occurrence.type, 'outros') as type, COUNT(*) as count");

    // Aplicar filtros
    if (filters?.municipality) {
      query.andWhere('occurrence.municipality = :municipality', { 
        municipality: filters.municipality 
      });
    }

    if (filters?.status) {
      query.andWhere('occurrence.status = :status', { status: filters.status });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('occurrence.occurrenceDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate
      });
    }

    // Obter contagens por tipo
    const typeCounts = await query
      .groupBy("COALESCE(occurrence.type, 'outros')")
      .getRawMany();

    // Converter para objeto
    const result: Record<string, number> = {};
    typeCounts.forEach(item => {
      result[item.type] = parseInt(item.count);
    });

    return result;
  }

  async getMunicipalityCounts(filters?: Partial<OccurrenceFilters>): Promise<Array<{ name: string; count: number }>> {
    const query = this.repository.createQueryBuilder('occurrence')
      .select('occurrence.municipality as name, COUNT(*) as count');

    // Aplicar filtros
    if (filters?.type) {
      query.andWhere('occurrence.type = :type', { type: filters.type });
    }

    if (filters?.status) {
      query.andWhere('occurrence.status = :status', { status: filters.status });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('occurrence.occurrenceDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate
      });
    }

    const municipalityCounts = await query
      .groupBy('occurrence.municipality')
      .orderBy('count', 'DESC')
      .getRawMany();

    return municipalityCounts.map(item => ({
      name: item.name,
      count: parseInt(item.count)
    }));
  }

  async getMonthlyStats(filters?: Partial<OccurrenceFilters>): Promise<Array<{ month: string; count: number }>> {
    const query = this.repository.createQueryBuilder('occurrence')
      .select("TO_CHAR(occurrence.occurrenceDate, 'YYYY-MM') as month, COUNT(*) as count");

    // Aplicar filtros
    if (filters?.municipality) {
      query.andWhere('occurrence.municipality = :municipality', { 
        municipality: filters.municipality 
      });
    }

    if (filters?.type) {
      query.andWhere('occurrence.type = :type', { type: filters.type });
    }

    if (filters?.status) {
      query.andWhere('occurrence.status = :status', { status: filters.status });
    }

    const monthlyStats = await query
      .groupBy("TO_CHAR(occurrence.occurrenceDate, 'YYYY-MM')")
      .orderBy('month', 'DESC')
      .limit(6) // Últimos 6 meses
      .getRawMany();

    // Formatar meses para exibição
    return monthlyStats.map(item => {
      const [year, month] = item.month.split('-');
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return {
        month: `${monthNames[parseInt(month) - 1]}/${year.slice(2)}`,
        count: parseInt(item.count)
      };
    });
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

  async getMonthlyStatsOld(year: number): Promise<Array<{month: number, count: number}>> {
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