// src/infrastructure/database/repositories/FeatureRepository.ts
// Enhanced with vote tracking and search functionality

import { IFeatureRepository } from '@core/domain/repositories/IFeatureRepository';
import { Feature, FeatureStatus, Priority } from '@core/domain/entities/Feature';
import { FeatureModel } from '../models/FeatureModel';
import { Op } from 'sequelize';

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
      model.voted_by || [], // New field
      model.approved_by || null, // New field
      model.approved_at || null, // New field
      model.approval_comment || null, // New field
      model.rejected_by || null, // New field
      model.rejected_at || null, // New field
      model.rejection_reason || null, // New field
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
        model.voted_by || [],
        model.approved_by || null,
        model.approved_at || null,
        model.approval_comment || null,
        model.rejected_by || null,
        model.rejected_at || null,
        model.rejection_reason || null,
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

    // Apply filters
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

    // Search functionality
    if (filters?.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } },
        { tags: { [Op.contains]: [filters.search] } },
      ];
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
        model.voted_by || [],
        model.approved_by || null,
        model.approved_at || null,
        model.approval_comment || null,
        model.rejected_by || null,
        model.rejected_at || null,
        model.rejection_reason || null,
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
      voted_by: feature.votedBy, // New field
      approved_by: feature.approvedBy, // New field
      approved_at: feature.approvedAt, // New field
      approval_comment: feature.approvalComment, // New field
      rejected_by: feature.rejectedBy, // New field
      rejected_at: feature.rejectedAt, // New field
      rejection_reason: feature.rejectionReason, // New field
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
        voted_by: feature.votedBy, // New field
        approved_by: feature.approvedBy, // New field
        approved_at: feature.approvedAt, // New field
        approval_comment: feature.approvalComment, // New field
        rejected_by: feature.rejectedBy, // New field
        rejected_at: feature.rejectedAt, // New field
        rejection_reason: feature.rejectionReason, // New field
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
