import { SprintRetrospectiveModel } from '../models/SprintRetrospectiveModel';

export interface ISprintRetrospectiveRepository {
  findBySprintId(sprintId: string): Promise<SprintRetrospective | null>;
  save(retrospective: SprintRetrospective): Promise<void>;
  update(retrospective: SprintRetrospective): Promise<void>;
  delete(sprintId: string): Promise<void>;
}

interface SprintRetrospective {
  id: string;
  sprintId: string;
  wentWell: string[];
  needsImprovement: string[];
  actionItems: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class SprintRetrospectiveRepository implements ISprintRetrospectiveRepository {
  async findBySprintId(sprintId: string): Promise<SprintRetrospective | null> {
    const model = await SprintRetrospectiveModel.findOne({
      where: { sprint_id: sprintId },
    });

    if (!model) return null;

    return {
      id: model.id,
      sprintId: model.sprint_id,
      wentWell: model.went_well,
      needsImprovement: model.needs_improvement,
      actionItems: model.action_items,
      createdAt: model.created_at,
      updatedAt: model.updated_at,
    };
  }

  async save(retrospective: SprintRetrospective): Promise<void> {
    await SprintRetrospectiveModel.create({
      id: retrospective.id,
      sprint_id: retrospective.sprintId,
      went_well: retrospective.wentWell,
      needs_improvement: retrospective.needsImprovement,
      action_items: retrospective.actionItems,
    });
  }

  async update(retrospective: SprintRetrospective): Promise<void> {
    await SprintRetrospectiveModel.update(
      {
        went_well: retrospective.wentWell,
        needs_improvement: retrospective.needsImprovement,
        action_items: retrospective.actionItems,
      },
      {
        where: { sprint_id: retrospective.sprintId },
      }
    );
  }

  async delete(sprintId: string): Promise<void> {
    await SprintRetrospectiveModel.destroy({
      where: { sprint_id: sprintId },
    });
  }
}
