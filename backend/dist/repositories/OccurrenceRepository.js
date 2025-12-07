"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OccurrenceRepository = void 0;
const Occurrence_1 = require("../entities/Occurrence");
const BaseRepository_1 = require("./BaseRepository");
class OccurrenceRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(Occurrence_1.Occurrence);
    }
    async findWithFilters(filters) {
        const { type, status, municipality, neighborhood, startDate, endDate, createdBy, search, page = 1, limit = 20 } = filters;
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
            query.andWhere('(occurrence.address ILIKE :search OR occurrence.description ILIKE :search OR occurrence.victimName ILIKE :search)', { search: `%${search}%` });
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
    async getStatusCounts(filters) {
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
        const counts = {
            total: 0,
            aberto: 0,
            em_andamento: 0,
            finalizado: 0,
            alerta: 0
        };
        // Preenche as contagens de forma type-safe
        result.forEach(item => {
            const status = item.occurrence_status;
            const count = parseInt(item.count);
            // Verifica se a chave existe no objeto
            if (status in counts) {
                counts[status] = count;
                counts.total += count;
            }
        });
        return counts;
    }
    async findByVehicle(vehicleId) {
        return await this.repository.find({
            where: { vehicle: { id: vehicleId } },
            relations: ['createdBy', 'vehicle'],
            order: { occurrenceDate: 'DESC' }
        });
    }
    async findByUser(userId) {
        return await this.repository.find({
            where: { createdBy: { id: userId } },
            relations: ['vehicle', 'images'],
            order: { occurrenceDate: 'DESC' }
        });
    }
    async getMunicipalityStats() {
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
    async getMonthlyStats(year) {
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
    async updateStatus(occurrenceId, status) {
        await this.repository.update(occurrenceId, { status });
        return await this.findById(occurrenceId);
    }
}
exports.OccurrenceRepository = OccurrenceRepository;
