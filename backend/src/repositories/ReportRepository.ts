import { AppDataSource } from '../config/database';
import { Report } from '../entities/Report';
import { BaseRepository } from './BaseRepository';

export interface ReportFilters {
  occurrenceId?: string;
  createdBy?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export class ReportRepository extends BaseRepository<Report> {
  constructor() {
    super(Report);
  }

  async findWithFilters(filters: ReportFilters): Promise<{ 
    reports: Report[]; 
    total: number;
  }> {
    const {
      occurrenceId,
      createdBy,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = filters;

    const query = this.repository.createQueryBuilder('report')
      .leftJoinAndSelect('report.occurrence', 'occurrence')
      .leftJoinAndSelect('report.createdBy', 'user')
      .leftJoinAndSelect('report.images', 'images');

    if (occurrenceId) {
      query.andWhere('report.occurrenceId = :occurrenceId', { occurrenceId });
    }

    if (createdBy) {
      query.andWhere('report.createdBy = :createdBy', { createdBy });
    }

    if (startDate && endDate) {
      query.andWhere('report.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      });
    }

    const skip = (page - 1) * limit;
    const [reports, total] = await query
      .skip(skip)
      .take(limit)
      .orderBy('report.createdAt', 'DESC')
      .getManyAndCount();

    return { reports, total };
  }

  async findByOccurrence(occurrenceId: string): Promise<Report[]> {
    return await this.repository.find({
      where: { occurrence: { id: occurrenceId } },
      relations: ['createdBy', 'images'],
      order: { createdAt: 'DESC' }
    });
  }

  async getOccurrenceReportsCount(occurrenceId: string): Promise<number> {
    return await this.repository.count({
      where: { occurrence: { id: occurrenceId } }
    });
  }
}