import { Repository, FindOptionsWhere, FindManyOptions, ObjectLiteral, DeepPartial } from 'typeorm';
import { AppDataSource } from '../config/database';

export abstract class BaseRepository<T extends ObjectLiteral> {
  protected repository: Repository<T>;

  constructor(entity: new () => T) {
    this.repository = AppDataSource.getRepository(entity);
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    const savedEntity = await this.repository.save(entity);
    return savedEntity as T;
  }

  async findById(id: string): Promise<T | null> {
    return await this.repository.findOneBy({ id } as any);
  }

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return await this.repository.find(options);
  }

  async update(id: string, data: DeepPartial<T>): Promise<T | null> {
    await this.repository.update(id, data as any);
    return await this.findById(id);
  }

  async save(entity: T): Promise<T> {
    return await this.repository.save(entity);
  }

  async saveMany(entities: T[]): Promise<T[]> {
    return await this.repository.save(entities);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected || 0) > 0;
  }

  async count(options?: FindManyOptions<T>): Promise<number> {
    return await this.repository.count(options);
  }

  async findOneBy(where: FindOptionsWhere<T>): Promise<T | null> {
    return await this.repository.findOneBy(where);
  }

  async findAndCount(options?: FindManyOptions<T>): Promise<[T[], number]> {
    return await this.repository.findAndCount(options);
  }

  async createQueryBuilder(alias?: string) {
    return this.repository.createQueryBuilder(alias);
  }
}