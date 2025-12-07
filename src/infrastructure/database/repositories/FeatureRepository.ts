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
      model.business_value || null, // ✅ ADDED
      model.target_users || null, // ✅ ADDED
      model.requester_id, // ✅ ADDED
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
      model.attachments || [], // ✅ ADDED
      model.target_version || null, // ✅ ADDED
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
        model.business_value || null, // ✅ ADDED
        model.target_users || null, // ✅ ADDED
        model.requester_id, // ✅ ADDED
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
        model.attachments || [], // ✅ ADDED
        model.target_version || null, // ✅ ADDED
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
        model.business_value || null, // ✅ ADDED
        model.target_users || null, // ✅ ADDED
        model.requester_id, // ✅ ADDED
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
        model.attachments || [], // ✅ ADDED
        model.target_version || null, // ✅ ADDED
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
      business_value: feature.businessValue, // ✅ ADDED
      target_users: feature.targetUsers, // ✅ ADDED
      requester_id: feature.requesterId, // ✅ ADDED
      status: feature.status,
      priority: feature.priority,
      assignee_id: feature.assigneeId,
      sprint_id: feature.sprintId,
      estimated_hours: feature.estimatedHours,
      actual_hours: feature.actualHours,
      votes: feature.votes,
      voted_by: feature.votedBy,
      approved_by: feature.approvedBy,
      approved_at: feature.approvedAt,
      approval_comment: feature.approvalComment,
      rejected_by: feature.rejectedBy,
      rejected_at: feature.rejectedAt,
      rejection_reason: feature.rejectionReason,
      attachments: feature.attachments, // ✅ ADDED
      target_version: feature.targetVersion, // ✅ ADDED
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
        business_value: feature.businessValue, // ✅ ADDED
        target_users: feature.targetUsers, // ✅ ADDED
        status: feature.status,
        priority: feature.priority,
        assignee_id: feature.assigneeId,
        sprint_id: feature.sprintId,
        estimated_hours: feature.estimatedHours,
        actual_hours: feature.actualHours,
        votes: feature.votes,
        voted_by: feature.votedBy,
        approved_by: feature.approvedBy,
        approved_at: feature.approvedAt,
        approval_comment: feature.approvalComment,
        rejected_by: feature.rejectedBy,
        rejected_at: feature.rejectedAt,
        rejection_reason: feature.rejectionReason,
        attachments: feature.attachments, // ✅ ADDED
        target_version: feature.targetVersion, // ✅ ADDED
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
