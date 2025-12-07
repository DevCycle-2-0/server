import { IFeatureRepository } from '@domain/repositories/IFeatureRepository';
import { Feature } from '@domain/entities/Feature';
import { FeatureModel } from '../models/FeatureModel';
import { Op } from 'sequelize';

export class FeatureRepository implements IFeatureRepository {
  async create(feature: Feature): Promise<Feature> {
    const created = await FeatureModel.create({
      id: feature.id,
      workspaceId: feature.workspaceId,
      title: feature.title,
      description: feature.description,
      stage: feature.stage,
      priority: feature.priority,
      status: feature.status,
      votes: feature.votes,
      storyPoints: feature.storyPoints,
      productId: feature.productId,
      sprintId: feature.sprintId,
      targetReleaseId: feature.targetReleaseId,
      assigneeId: feature.assigneeId,
      reporterId: feature.reporterId,
      tags: feature.tags,
      attachments: feature.attachments,
      customFields: feature.customFields,
      dueDate: feature.dueDate,
      completedAt: feature.completedAt,
    });

    return this.toDomain(created);
  }

  async findById(id: string): Promise<Feature | null> {
    const feature = await FeatureModel.findByPk(id, {
      include: ['product', 'sprint', 'assignee', 'reporter'],
    });
    return feature ? this.toDomain(feature) : null;
  }

  async findByWorkspaceId(
    workspaceId: string,
    filters: any,
    page: number,
    limit: number
  ): Promise<{ features: Feature[]; total: number }> {
    const offset = (page - 1) * limit;
    const where: any = { workspaceId };

    if (filters.productId) where.productId = filters.productId;
    if (filters.sprintId) where.sprintId = filters.sprintId;
    if (filters.stage) where.stage = filters.stage;
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.assigneeId) where.assigneeId = filters.assigneeId;
    if (filters.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    const { rows, count } = await FeatureModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: ['product', 'sprint', 'assignee', 'reporter'],
    });

    return {
      features: rows.map(f => this.toDomain(f)),
      total: count,
    };
  }

  async update(id: string, data: Partial<Feature>): Promise<Feature> {
    await FeatureModel.update(data, { where: { id } });
    const updated = await FeatureModel.findByPk(id);
    if (!updated) throw new Error('Feature not found');
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await FeatureModel.destroy({ where: { id } });
  }

  private toDomain(model: FeatureModel): Feature {
    return new Feature(
      model.id,
      model.workspaceId,
      model.title,
      model.description,
      model.stage,
      model.priority,
      model.status,
      model.votes,
      model.storyPoints,
      model.productId,
      model.sprintId,
      model.targetReleaseId,
      model.assigneeId,
      model.reporterId,
      model.tags,
      model.attachments,
      model.customFields,
      model.dueDate,
      model.completedAt,
      model.createdAt,
      model.updatedAt
    );
  }
}
