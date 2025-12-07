import { Repository, FindOptionsWhere, Like, Brackets } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { BaseRepository } from './BaseRepository';

export interface UserFilters {
  name?: string;
  email?: string;
  role?: string;
  unit?: string;
  page?: number;
  limit?: number;
}

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { email }
    });
  }

  async findByRegistration(registration: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { registration }
    });
  }

  async findWithFilters(filters: UserFilters): Promise<{ users: User[]; total: number }> {
    const {
      name,
      email,
      role,
      unit,
      page = 1,
      limit = 20
    } = filters;

    const query = this.repository.createQueryBuilder('user');

    // Aplicar filtros
    if (name) {
      query.andWhere('user.name ILIKE :name', { name: `%${name}%` });
    }

    if (email) {
      query.andWhere('user.email ILIKE :email', { email: `%${email}%` });
    }

    if (role) {
      query.andWhere('user.role = :role', { role });
    }

    if (unit) {
      query.andWhere('user.unit = :unit', { unit });
    }

    // Paginação
    const skip = (page - 1) * limit;
    const [users, total] = await query
      .skip(skip)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    return { users, total };
  }

  async getStatistics(): Promise<{
    total: number;
    byRole: Record<string, number>;
    byUnit: Record<string, number>;
  }> {
    const total = await this.repository.count();
    
    // Usuários por role
    const byRole = await this.repository
      .createQueryBuilder('user')
      .select('user.role, COUNT(*) as count')
      .groupBy('user.role')
      .getRawMany();

    // Usuários por unidade
    const byUnit = await this.repository
      .createQueryBuilder('user')
      .select('user.unit, COUNT(*) as count')
      .where('user.unit IS NOT NULL')
      .groupBy('user.unit')
      .getRawMany();

    return {
      total,
      byRole: byRole.reduce((acc, curr) => {
        acc[curr.role] = parseInt(curr.count);
        return acc;
      }, {} as Record<string, number>),
      byUnit: byUnit.reduce((acc, curr) => {
        acc[curr.unit] = parseInt(curr.count);
        return acc;
      }, {} as Record<string, number>)
    };
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    await this.repository.update(userId, { password: newPassword });
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User | null> {
    const { password, ...updateData } = data;
    await this.repository.update(userId, updateData as any);
    return await this.findById(userId);
  }
}