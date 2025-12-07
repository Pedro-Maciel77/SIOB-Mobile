"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const database_1 = require("../config/database");
class BaseRepository {
    repository;
    constructor(entity) {
        this.repository = database_1.AppDataSource.getRepository(entity);
    }
    async create(data) {
        const entity = this.repository.create(data);
        const savedEntity = await this.repository.save(entity);
        return savedEntity;
    }
    async findById(id) {
        return await this.repository.findOneBy({ id });
    }
    async findAll(options) {
        return await this.repository.find(options);
    }
    async update(id, data) {
        await this.repository.update(id, data);
        return await this.findById(id);
    }
    async save(entity) {
        return await this.repository.save(entity);
    }
    async saveMany(entities) {
        return await this.repository.save(entities);
    }
    async delete(id) {
        const result = await this.repository.delete(id);
        return (result.affected || 0) > 0;
    }
    async count(options) {
        return await this.repository.count(options);
    }
    async findOneBy(where) {
        return await this.repository.findOneBy(where);
    }
    async findAndCount(options) {
        return await this.repository.findAndCount(options);
    }
    async createQueryBuilder(alias) {
        return this.repository.createQueryBuilder(alias);
    }
}
exports.BaseRepository = BaseRepository;
