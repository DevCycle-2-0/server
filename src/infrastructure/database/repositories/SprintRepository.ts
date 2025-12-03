import { ISprintRepository } from '@core/domain/repositories/ISprintRepository';
import { Sprint, SprintStatus, SprintDuration } from '@core/domain/entities/Sprint';
import { SprintModel } from '../models/SprintModel';

export class SprintRepository implements ISprintRepository {
  async findById(id: string): Promise<Sprint | null> {
    const model = await SprintModel.findByPk(id);
    if (!model) return null;

    return Sprint.reconstitute(
      model.id,
      model.workspace_id,
      model.product_id,
      model.name,
      model.goal || null,
      model.status as SprintStatus,
      model.duration as SprintDuration,
      model.start_date,
      model.end_date,
      model.velocity,
      model.created_at,
      model.updated_at
    );
  }

  async findByProduct(productId: string): Promise<Sprint[]> {
    const models = await SprintModel.findAll({
      where: { product_id: productId },
      order: [['start_date', 'DESC']],
    });

    return models.map((model) =>
      Sprint.reconstitute(
        model.id,
        model.workspace_id,
        model.product_id,
        model.name,
        model.goal || null,
        model.status as SprintStatus,
        model.duration as SprintDuration,
        model.start_date,
        model.end_date,
        model.velocity,
        model.created_at,
        model.updated_at
      )
    );
  }

  async findActive(workspaceId: string): Promise<Sprint[]> {
    const models = await SprintModel.findAll({
      where: {
        workspace_id: workspaceId,
        status: SprintStatus.ACTIVE,
      },
      order: [['start_date', 'DESC']],
    });

    return models.map((model) =>
      Sprint.reconstitute(
        model.id,
        model.workspace_id,
        model.product_id,
        model.name,
        model.goal || null,
        model.status as SprintStatus,
        model.duration as SprintDuration,
        model.start_date,
        model.end_date,
        model.velocity,
        model.created_at,
        model.updated_at
      )
    );
  }

  async save(sprint: Sprint): Promise<void> {
    await SprintModel.create({
      id: sprint.id,
      workspace_id: sprint.workspaceId,
      product_id: sprint.productId,
      name: sprint.name,
      goal: sprint.goal,
      status: sprint.status,
      duration: sprint.duration,
      start_date: sprint.startDate,
      end_date: sprint.endDate,
      velocity: sprint.velocity,
    });
  }

  async update(sprint: Sprint): Promise<void> {
    await SprintModel.update(
      {
        name: sprint.name,
        goal: sprint.goal,
        status: sprint.status,
        velocity: sprint.velocity,
        updated_at: sprint.updatedAt,
      },
      {
        where: { id: sprint.id },
      }
    );
  }

  async delete(id: string): Promise<void> {
    await SprintModel.destroy({ where: { id } });
  }
}
