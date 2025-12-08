import { IFeatureRepository } from "@domain/repositories/IFeatureRepository";
import { Feature } from "@domain/entities/Feature.entity";
import { Product } from "@domain/entities/Product.entity";
import { User } from "@domain/entities/User.entity";
import { Sprint } from "@domain/entities/Sprint.entity";
import { Task } from "@domain/entities/Task.entity";
import { AppError } from "@shared/errors/AppError";
import { Op } from "sequelize";

export class FeatureRepository implements IFeatureRepository {
  async create(data: Partial<Feature>): Promise<Feature> {
    return await Feature.create(data as any);
  }

  async findById(id: string): Promise<Feature | null> {
    return await Feature.findByPk(id, {
      include: [
        { model: Product },
        { model: User, as: "requester" },
        { model: User, as: "assignee" },
        { model: Sprint },
        { model: Task },
      ],
    });
  }

  async findAll(filters: any): Promise<{ rows: Feature[]; count: number }> {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      productId,
      search,
    } = filters;
    const where: any = {};

    if (status) where.status = status.split(",");
    if (priority) where.priority = priority.split(",");
    if (productId) where.productId = productId;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    return await Feature.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      include: [
        { model: Product },
        { model: User, as: "requester" },
        { model: User, as: "assignee" },
      ],
    });
  }

  async update(id: string, data: Partial<Feature>): Promise<Feature> {
    const feature = await Feature.findByPk(id);
    if (!feature) throw AppError.notFound("Feature not found");
    return await feature.update(data);
  }

  async delete(id: string): Promise<void> {
    const feature = await Feature.findByPk(id);
    if (!feature) throw AppError.notFound("Feature not found");
    await feature.destroy();
  }

  async vote(id: string, userId: string): Promise<Feature> {
    const feature = await Feature.findByPk(id);
    if (!feature) throw AppError.notFound("Feature not found");

    const votedBy = feature.votedBy || [];
    if (votedBy.includes(userId)) {
      throw AppError.badRequest("Already voted");
    }

    return await feature.update({
      votes: feature.votes + 1,
      votedBy: [...votedBy, userId],
    });
  }

  async unvote(id: string, userId: string): Promise<Feature> {
    const feature = await Feature.findByPk(id);
    if (!feature) throw AppError.notFound("Feature not found");

    const votedBy = feature.votedBy || [];
    if (!votedBy.includes(userId)) {
      throw AppError.badRequest("Not voted yet");
    }

    return await feature.update({
      votes: feature.votes - 1,
      votedBy: votedBy.filter((id) => id !== userId),
    });
  }
}
