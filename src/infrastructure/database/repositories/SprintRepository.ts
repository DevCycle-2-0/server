import { ISprintRepository } from "@domain/repositories/ISprintRepository";
import { Sprint } from "@domain/entities/Sprint";
import { SprintModel } from "../models/SprintModel";

export class SprintRepository implements ISprintRepository {
  async create(sprint: Sprint): Promise<Sprint> {
    const created = await SprintModel.create({
      id: sprint.id,
      workspaceId: sprint.workspaceId,
      name: sprint.name,
      goal: sprint.goal,
      status: sprint.status,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      capacityPoints: sprint.capacityPoints,
      completedPoints: sprint.completedPoints,
      velocity: sprint.velocity,
      productId: sprint.productId,
      retrospective: sprint.retrospective,
      createdBy: sprint.createdBy,
    });

    return this.toDomain(created);
  }

  async findById(id: string): Promise<Sprint | null> {
    const sprint = await SprintModel.findByPk(id, {
      include: ["product", "creator", "features", "tasks"],
    });
    return sprint ? this.toDomain(sprint) : null;
  }

  async findByWorkspaceId(
    workspaceId: string,
    filters: any,
    page: number,
    limit: number
  ): Promise<{ sprints: Sprint[]; total: number }> {
    const offset = (page - 1) * limit;
    const where: any = { workspaceId };

    if (filters.productId) where.productId = filters.productId;
    if (filters.status) where.status = filters.status;

    const { rows, count } = await SprintModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [["startDate", "DESC"]],
      include: ["product"],
    });

    return {
      sprints: rows.map((s) => this.toDomain(s)),
      total: count,
    };
  }

  async update(id: string, data: Partial<Sprint>): Promise<Sprint> {
    await SprintModel.update(data, { where: { id } });
    const updated = await SprintModel.findByPk(id);
    if (!updated) throw new Error("Sprint not found");
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await SprintModel.destroy({ where: { id } });
  }

  private toDomain(model: SprintModel): Sprint {
    return new Sprint(
      model.id,
      model.workspaceId,
      model.name,
      model.startDate,
      model.endDate,
      model.status,
      model.goal,
      model.capacityPoints,
      model.completedPoints,
      model.velocity,
      model.productId,
      model.retrospective,
      model.createdBy,
      model.createdAt,
      model.updatedAt
    );
  }
}
