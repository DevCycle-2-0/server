import { Bug, BugStatus, BugSeverity } from '@core/domain/entities/Bug';
import { BugModel } from '../models/BugModel';

export interface IBugRepository {
  findById(id: string): Promise<Bug | null>;
  findByWorkspace(workspaceId: string, filters?: any): Promise<Bug[]>;
  findByProduct(productId: string): Promise<Bug[]>;
  save(bug: Bug): Promise<void>;
  update(bug: Bug): Promise<void>;
  delete(id: string): Promise<void>;
}

export class BugRepository implements IBugRepository {
  async findById(id: string): Promise<Bug | null> {
    const model = await BugModel.findByPk(id);
    if (!model) return null;

    return Bug.reconstitute(
      model.id,
      model.workspace_id,
      model.product_id,
      model.sprint_id || null,
      model.title,
      model.description,
      model.steps_to_reproduce || null,
      model.expected_behavior || null,
      model.actual_behavior || null,
      model.status as BugStatus,
      model.severity as BugSeverity,
      model.environment || null,
      model.browser || null,
      model.os || null,
      model.reporter_id,
      model.assignee_id || null,
      model.attachments,
      model.tags,
      model.metadata,
      model.resolved_at || null,
      model.created_at,
      model.updated_at
    );
  }

  async findByWorkspace(workspaceId: string, filters?: any): Promise<Bug[]> {
    const where: any = { workspace_id: workspaceId };

    if (filters?.status) where.status = filters.status;
    if (filters?.severity) where.severity = filters.severity;
    if (filters?.productId) where.product_id = filters.productId;
    if (filters?.assigneeId) where.assignee_id = filters.assigneeId;

    const models = await BugModel.findAll({
      where,
      order: [
        ['severity', 'DESC'],
        ['created_at', 'DESC'],
      ],
      limit: filters?.limit || 100,
      offset: filters?.offset || 0,
    });

    return models.map((model) =>
      Bug.reconstitute(
        model.id,
        model.workspace_id,
        model.product_id,
        model.sprint_id || null,
        model.title,
        model.description,
        model.steps_to_reproduce || null,
        model.expected_behavior || null,
        model.actual_behavior || null,
        model.status as BugStatus,
        model.severity as BugSeverity,
        model.environment || null,
        model.browser || null,
        model.os || null,
        model.reporter_id,
        model.assignee_id || null,
        model.attachments,
        model.tags,
        model.metadata,
        model.resolved_at || null,
        model.created_at,
        model.updated_at
      )
    );
  }

  async findByProduct(productId: string): Promise<Bug[]> {
    const models = await BugModel.findAll({
      where: { product_id: productId },
      order: [
        ['severity', 'DESC'],
        ['created_at', 'DESC'],
      ],
    });

    return models.map((model) =>
      Bug.reconstitute(
        model.id,
        model.workspace_id,
        model.product_id,
        model.sprint_id || null,
        model.title,
        model.description,
        model.steps_to_reproduce || null,
        model.expected_behavior || null,
        model.actual_behavior || null,
        model.status as BugStatus,
        model.severity as BugSeverity,
        model.environment || null,
        model.browser || null,
        model.os || null,
        model.reporter_id,
        model.assignee_id || null,
        model.attachments,
        model.tags,
        model.metadata,
        model.resolved_at || null,
        model.created_at,
        model.updated_at
      )
    );
  }

  async save(bug: Bug): Promise<void> {
    await BugModel.create({
      id: bug.id,
      workspace_id: bug.workspaceId,
      product_id: bug.productId,
      sprint_id: bug.sprintId,
      title: bug.title,
      description: bug.description,
      steps_to_reproduce: bug.stepsToReproduce,
      expected_behavior: bug.expectedBehavior,
      actual_behavior: bug.actualBehavior,
      status: bug.status,
      severity: bug.severity,
      environment: bug.environment,
      browser: bug.browser,
      os: bug.os,
      reporter_id: bug.reporterId,
      assignee_id: bug.assigneeId,
      attachments: bug.attachments,
      tags: bug.tags,
      metadata: bug.metadata || {},
      resolved_at: bug.resolvedAt,
    });
  }

  async update(bug: Bug): Promise<void> {
    await BugModel.update(
      {
        title: bug.title,
        description: bug.description,
        steps_to_reproduce: bug.stepsToReproduce,
        expected_behavior: bug.expectedBehavior,
        actual_behavior: bug.actualBehavior,
        status: bug.status,
        severity: bug.severity,
        environment: bug.environment,
        browser: bug.browser,
        os: bug.os,
        assignee_id: bug.assigneeId,
        attachments: bug.attachments,
        tags: bug.tags,
        metadata: bug.metadata || {},
        resolved_at: bug.resolvedAt,
        updated_at: bug.updatedAt,
      },
      {
        where: { id: bug.id },
      }
    );
  }

  async delete(id: string): Promise<void> {
    await BugModel.destroy({ where: { id } });
  }
}
