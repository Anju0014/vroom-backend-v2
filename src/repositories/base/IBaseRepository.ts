import { ClientSession, FilterQuery, UpdateQuery } from 'mongoose';

export interface IBaseRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  findOne(condition: FilterQuery<T>): Promise<T | null>;
  findWithPagination(skip: number, limit: number): Promise<T[]>;
  update(id: string, data: UpdateQuery<T>): Promise<T | null>;
  softDelete(id: string): Promise<T | null>;
  delete(id: string): Promise<T | null>;
  withTransaction(callback: (session: ClientSession) => Promise<void>): Promise<void>;
}
