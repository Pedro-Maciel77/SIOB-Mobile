"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogRepository = void 0;
const AuditLog_1 = require("../entities/AuditLog");
const BaseRepository_1 = require("./BaseRepository");
class AuditLogRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(AuditLog_1.AuditLog);
    }
    async logAction(data) {
        return await this.create(data);
    }
    async findWithFilters(filters) {
        const { userId, action, entity, entityId, startDate, endDate, page = 1, limit = 50 } = filters;
        const query = this.repository.createQueryBuilder('log')
            .leftJoinAndSelect('log.user', 'user')
            .select([
            'log',
            'user.id',
            'user.name',
            'user.email',
            'user.role'
        ]);
        if (userId) {
            query.andWhere('log.userId = :userId', { userId });
        }
        if (action) {
            query.andWhere('log.action = :action', { action });
        }
        if (entity) {
            query.andWhere('log.entity = :entity', { entity });
        }
        if (entityId) {
            query.andWhere('log.entityId = :entityId', { entityId });
        }
        if (startDate && endDate) {
            query.andWhere('log.createdAt BETWEEN :startDate AND :endDate', {
                startDate,
                endDate
            });
        }
        const skip = (page - 1) * limit;
        const [logs, total] = await query
            .skip(skip)
            .take(limit)
            .orderBy('log.createdAt', 'DESC')
            .getManyAndCount();
        return { logs, total };
    }
    async getUserActivity(userId, days = 30) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return await this.repository.find({
            where: {
                user: { id: userId },
                createdAt: { $gte: date }
            },
            order: { createdAt: 'DESC' },
            take: 100
        });
    }
    async getSystemActivity(days = 7) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        // Total de ações
        const totalActions = await this.repository.count({
            where: { createdAt: { $gte: date } }
        });
        // Ações por tipo
        const actionsByType = await this.repository
            .createQueryBuilder('log')
            .select('log.action, COUNT(*) as count')
            .where('log.createdAt >= :date', { date })
            .groupBy('log.action')
            .getRawMany();
        // Top usuários
        const topUsers = await this.repository
            .createQueryBuilder('log')
            .select('user.id as userId, user.name as userName, COUNT(*) as actions')
            .leftJoin('log.user', 'user')
            .where('log.createdAt >= :date', { date })
            .groupBy('user.id, user.name')
            .orderBy('actions', 'DESC')
            .limit(10)
            .getRawMany();
        return {
            totalActions,
            actionsByType: actionsByType.reduce((acc, curr) => {
                acc[curr.log_action] = parseInt(curr.count);
                return acc;
            }, {}),
            topUsers: topUsers.map(user => ({
                userId: user.userid,
                userName: user.username,
                actions: parseInt(user.actions)
            }))
        };
    }
}
exports.AuditLogRepository = AuditLogRepository;
