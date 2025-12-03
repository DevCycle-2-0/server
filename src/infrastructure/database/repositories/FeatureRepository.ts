import { IFeatureRepository } from '@core/domain/repositories/IFeatureRepository';
import { Feature, FeatureStatus, Priority } from '@core/domain/entities/Feature';
import { FeatureModel } from '../models/FeatureModel';

export class FeatureRepository implements IFeatureRepository {
  async findById(id: string): Promise<Feature | null> {
    const model = await FeatureModel.findByPk(id);
    if (!model) return null;

    return Feature.reconstitute(
      model.id,
      model.workspace_id,
      model.product_id,
      model.title,
      model.description || null,
      model.status as FeatureStatus,
      model.priority as Priority,
      model.assignee_id || null,
      model.sprint_id || null,
      model.estimated_hours || null,
      model.actual_hours || null,
      model.votes,
      model.tags,
      model.metadata,
      model.completed_at || null,
      model.created_at,
      model.updated_at
    );
  }

  async findByProduct(productId: string): Promise<Feature[]> {
    const models = await FeatureModel.findAll({
      where: { product_id: productId },
      order: [['created_at', 'DESC']],
    });

    return models.map((model) =>
      Feature.reconstitute(
        model.id,
        model.workspace_id,
        model.product_id,
        model.title,
        model.description || null,
        model.status as FeatureStatus,
        model.priority as Priority,
        model.assignee_id || null,
        model.sprint_id || null,
        model.estimated_hours || null,
        model.actual_hours || null,
        model.votes,
        model.tags,
        model.metadata,
        model.completed_at || null,
        model.created_at,
        model.updated_at
      )
    );
  }

  async findByWorkspace(workspaceId: string, filters?: any): Promise<Feature[]> {
    const where: any = { workspace_id: workspaceId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.productId) {
      where.product_id = filters.productId;
    }

    if (filters?.sprintId) {
      where.sprint_id = filters.sprintId;
    }

    if (filters?.assigneeId) {
      where.assignee_id = filters.assigneeId;
    }

    const models = await FeatureModel.findAll({
      where,
      order: [
        ['votes', 'DESC'],
        ['created_at', 'DESC'],
      ],
      limit: filters?.limit || 100,
      offset: filters?.offset || 0,
    });

    return models.map((model) =>
      Feature.reconstitute(
        model.id,
        model.workspace_id,
        model.product_id,
        model.title,
        model.description || null,
        model.status as FeatureStatus,
        model.priority as Priority,
        model.assignee_id || null,
        model.sprint_id || null,
        model.estimated_hours || null,
        model.actual_hours || null,
        model.votes,
        model.tags,
        model.metadata,
        model.completed_at || null,
        model.created_at,
        model.updated_at
      )
    );
  }

  async save(feature: Feature): Promise<void> {
    await FeatureModel.create({
      id: feature.id,
      workspace_id: feature.workspaceId,
      product_id: feature.productId,
      title: feature.title,
      description: feature.description,
      status: feature.status,
      priority: feature.priority,
      assignee_id: feature.assigneeId,
      sprint_id: feature.sprintId,
      estimated_hours: feature.estimatedHours,
      actual_hours: feature.actualHours,
      votes: feature.votes,
      tags: feature.tags,
      metadata: feature.metadata || {},
      completed_at: feature.completedAt,
    });
  }

  async update(feature: Feature): Promise<void> {
    await FeatureModel.update(
      {
        title: feature.title,
        description: feature.description,
        status: feature.status,
        priority: feature.priority,
        assignee_id: feature.assigneeId,
        sprint_id: feature.sprintId,
        estimated_hours: feature.estimatedHours,
        actual_hours: feature.actualHours,
        votes: feature.votes,
        tags: feature.tags,
        metadata: feature.metadata || {},
        completed_at: feature.completedAt,
        updated_at: feature.updatedAt,
      },
      {
        where: { id: feature.id },
      }
    );
  }

  async delete(id: string): Promise<void> {
    await FeatureModel.destroy({ where: { id } });
  }
}
