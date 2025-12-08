import { IFeatureRepository } from "@domain/repositories/IFeatureRepository";
import { Feature } from "@domain/entities/Feature.entity";
import { Platform, Priority } from "@shared/types/common.types";

export interface CreateFeatureDTO {
  title: string;
  description: string;
  priority: Priority;
  productId: string;
  platform: Platform;
  requestedBy: string;
  tags?: string[];
  dueDate?: Date;
}

export class CreateFeatureUseCase {
  constructor(private featureRepository: IFeatureRepository) {}

  async execute(data: CreateFeatureDTO): Promise<Feature> {
    return await this.featureRepository.create({
      ...data,
      status: "idea",
      votes: 0,
      votedBy: [],
    });
  }
}
