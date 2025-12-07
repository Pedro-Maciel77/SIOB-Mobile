import { AppDataSource } from '../config/database';
import { Municipality } from '../entities/Municipality';
import { BaseRepository } from './BaseRepository';

export class MunicipalityRepository extends BaseRepository<Municipality> {
  constructor() {
    super(Municipality);
  }

  async findByName(name: string): Promise<Municipality | null> {
    return await this.repository.findOne({
      where: { name }
    });
  }

  async findActive(): Promise<Municipality[]> {
    return await this.repository.find({
      where: { active: true },
      order: { name: 'ASC' }
    });
  }

  async getMunicipalityWithStats(municipalityId: number): Promise<{
    municipality: Municipality;
    totalOccurrences: number;
    occurrencesLastMonth: number;
    mostCommonType: string;
  }> {
    const municipality = await this.repository.findOne({
      where: { id: municipalityId }
    });

    if (!municipality) {
      throw new Error('Município não encontrado');
    }

    // Estatísticas (simplificado - na prática, seria uma query mais complexa)
    const totalOccurrences = await AppDataSource.getRepository('occurrence')
      .createQueryBuilder('occurrence')
      .where('occurrence.municipality = :name', { name: municipality.name })
      .getCount();

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const occurrencesLastMonth = await AppDataSource.getRepository('occurrence')
      .createQueryBuilder('occurrence')
      .where('occurrence.municipality = :name', { name: municipality.name })
      .andWhere('occurrence.occurrenceDate >= :date', { date: oneMonthAgo })
      .getCount();

    const mostCommonType = await AppDataSource.getRepository('occurrence')
      .createQueryBuilder('occurrence')
      .select('occurrence.type, COUNT(*) as count')
      .where('occurrence.municipality = :name', { name: municipality.name })
      .groupBy('occurrence.type')
      .orderBy('count', 'DESC')
      .limit(1)
      .getRawOne();

    return {
      municipality,
      totalOccurrences,
      occurrencesLastMonth,
      mostCommonType: mostCommonType?.type || 'Nenhuma'
    };
  }
}