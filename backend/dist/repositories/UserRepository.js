"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const User_1 = require("../entities/User");
const BaseRepository_1 = require("./BaseRepository");
class UserRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(User_1.User);
    }
    async findByEmail(email) {
        return await this.repository.findOne({
            where: { email }
        });
    }
    async findByRegistration(registration) {
        return await this.repository.findOne({
            where: { registration }
        });
    }
    async findWithFilters(filters) {
        const { name, email, role, unit, page = 1, limit = 20 } = filters;
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
    async getStatistics() {
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
            }, {}),
            byUnit: byUnit.reduce((acc, curr) => {
                acc[curr.unit] = parseInt(curr.count);
                return acc;
            }, {})
        };
    }
    async updatePassword(userId, newPassword) {
        await this.repository.update(userId, { password: newPassword });
    }
    async updateProfile(userId, data) {
        const { password, ...updateData } = data;
        await this.repository.update(userId, updateData);
        return await this.findById(userId);
    }
}
exports.UserRepository = UserRepository;
