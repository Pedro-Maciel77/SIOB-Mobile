import { AppDataSource } from '../config/database';
import { AuditLog } from '../entities/AuditLog';
import { BaseRepository } from './BaseRepository';

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  entity?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export class AuditLogRepository extends BaseRepository<AuditLog> {
  constructor() {
    super(AuditLog);
  }

  async logAction(data: {
    userId: string;
    action: AuditLog['action'];
    entity: AuditLog['entity'];
    entityId?: string;
    details?: Record<string, any>;
    changes?: Record<string, any>;
  }): Promise<AuditLog> {
    return await this.create(data);
  }

  async findWithFilters(filters: AuditLogFilters): Promise<{ 
    logs: AuditLog[]; 
    total: number;
  }> {
    const {
      userId,
      action,
      entity,
      entityId,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = filters;

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

  async getUserActivity(userId: string, days: number = 30): Promise<AuditLog[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    return await this.repository.find({
      where: { 
        user: { id: userId },
        createdAt: { $gte: date } as any
      },
      order: { createdAt: 'DESC' },
      take: 100
    });
  }

  async getSystemActivity(days: number = 7): Promise<{
    totalActions: number;
    actionsByType: Record<string, number>;
    topUsers: Array<{userId: string, userName: string, actions: number}>;
  }> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    // Total de ações
    const totalActions = await this.repository.count({
      where: { createdAt: { $gte: date } as any }
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
      }, {} as Record<string, number>),
      topUsers: topUsers.map(user => ({
        userId: user.userid,
        userName: user.username,
        actions: parseInt(user.actions)
      }))
    };
  }
}