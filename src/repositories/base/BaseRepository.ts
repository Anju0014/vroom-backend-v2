import { Model, Document, ClientSession, UpdateQuery, FilterQuery } from 'mongoose';
import { IBaseRepository } from '@repositories/base/IBaseRepository';

export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
  constructor(private model: Model<T>) {}
  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }
  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }
  async findAll(): Promise<T[]> {
    return this.model.find().exec();
  }
  async findOne(condition: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(condition).exec();
  }
  async findWithPagination(skip: number, limit: number): Promise<T[]> {
    return this.model.find().skip(skip).limit(limit).exec();
  }
  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }
  async softDelete(id: string): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).exec();
  }
  async delete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }
  async withTransaction(callback: (session: ClientSession) => Promise<void>): Promise<void> {
    const session = await this.model.db.startSession();
    session.startTransaction();
    try {
      await callback(session);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
