import { Feature } from "../entities/Feature.entity";

export interface IFeatureRepository {
  create(data: Partial<Feature>): Promise<Feature>;
  findById(id: string): Promise<Feature | null>;
  findAll(filters: any): Promise<{ rows: Feature[]; count: number }>;
  update(id: string, data: Partial<Feature>): Promise<Feature>;
  delete(id: string): Promise<void>;
  vote(id: string, userId: string): Promise<Feature>;
  unvote(id: string, userId: string): Promise<Feature>;
}
