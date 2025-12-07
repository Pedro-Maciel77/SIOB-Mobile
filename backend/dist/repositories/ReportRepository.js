"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportRepository = void 0;
const Report_1 = require("../entities/Report");
const BaseRepository_1 = require("./BaseRepository");
class ReportRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(Report_1.Report);
    }
    async findWithFilters(filters) {
        const { occurrenceId, createdBy, startDate, endDate, page = 1, limit = 20 } = filters;
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
    async findByOccurrence(occurrenceId) {
        return await this.repository.find({
            where: { occurrence: { id: occurrenceId } },
            relations: ['createdBy', 'images'],
            order: { createdAt: 'DESC' }
        });
    }
    async getOccurrenceReportsCount(occurrenceId) {
        return await this.repository.count({
            where: { occurrence: { id: occurrenceId } }
        });
    }
}
exports.ReportRepository = ReportRepository;
