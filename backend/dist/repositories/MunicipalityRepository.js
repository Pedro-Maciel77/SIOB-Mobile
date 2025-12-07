"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MunicipalityRepository = void 0;
const database_1 = require("../config/database");
const Municipality_1 = require("../entities/Municipality");
const BaseRepository_1 = require("./BaseRepository");
class MunicipalityRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(Municipality_1.Municipality);
    }
    async findByName(name) {
        return await this.repository.findOne({
            where: { name }
        });
    }
    async findActive() {
        return await this.repository.find({
            where: { active: true },
            order: { name: 'ASC' }
        });
    }
    async getMunicipalityWithStats(municipalityId) {
        const municipality = await this.repository.findOne({
            where: { id: municipalityId }
        });
        if (!municipality) {
            throw new Error('Município não encontrado');
        }
        // Estatísticas (simplificado - na prática, seria uma query mais complexa)
        const totalOccurrences = await database_1.AppDataSource.getRepository('occurrence')
            .createQueryBuilder('occurrence')
            .where('occurrence.municipality = :name', { name: municipality.name })
            .getCount();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const occurrencesLastMonth = await database_1.AppDataSource.getRepository('occurrence')
            .createQueryBuilder('occurrence')
            .where('occurrence.municipality = :name', { name: municipality.name })
            .andWhere('occurrence.occurrenceDate >= :date', { date: oneMonthAgo })
            .getCount();
        const mostCommonType = await database_1.AppDataSource.getRepository('occurrence')
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
exports.MunicipalityRepository = MunicipalityRepository;
