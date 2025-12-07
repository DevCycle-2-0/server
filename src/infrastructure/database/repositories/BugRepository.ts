import { IBugRepository } from "@domain/repositories/IBugRepository";
import { Bug } from "@domain/entities/Bug";
import { BugModel } from "../models/BugModel";
import { Op } from "sequelize";

export class BugRepository implements IBugRepository {
  async create(bug: Bug): Promise<Bug> {
    const created = await BugModel.create({
      id: bug.id,
      workspaceId: bug.workspaceId,
      title: bug.title,
      description: bug.description,
      stepsToReproduce: bug.stepsToReproduce,
      expectedBehavior: bug.expectedBehavior,
      actualBehavior: bug.actualBehavior,
      environment: bug.environment,
      severity: bug.severity,
      priority: bug.priority,
      status: bug.status,
      productId: bug.productId,
      featureId: bug.featureId,
      sprintId: bug.sprintId,
      assigneeId: bug.assigneeId,
      reporterId: bug.reporterId,
      tags: bug.tags,
      attachments: bug.attachments,
      resolution: bug.resolution,
      resolvedAt: bug.resolvedAt,
    });

    return this.toDomain(created);
  }

  async findById(id: string): Promise<Bug | null> {
    const bug = await BugModel.findByPk(id, {
      include: ["product", "feature", "sprint", "assignee", "reporter"],
    });
    return bug ? this.toDomain(bug) : null;
  }

  async findByWorkspaceId(
    workspaceId: string,
    filters: any,
    page: number,
    limit: number
  ): Promise<{ bugs: Bug[]; total: number }> {
    const offset = (page - 1) * limit;
    const where: any = { workspaceId };

    if (filters.productId) where.productId = filters.productId;
    if (filters.featureId) where.featureId = filters.featureId;
    if (filters.sprintId) where.sprintId = filters.sprintId;
    if (filters.status) where.status = filters.status;
    if (filters.severity) where.severity = filters.severity;
    if (filters.priority) where.priority = filters.priority;
    if (filters.assigneeId) where.assigneeId = filters.assigneeId;
    if (filters.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    const { rows, count } = await BugModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: ["product", "feature", "sprint", "assignee", "reporter"],
    });

    return {
      bugs: rows.map((b) => this.toDomain(b)),
      total: count,
    };
  }

  async update(id: string, data: Partial<Bug>): Promise<Bug> {
    await BugModel.update(data, { where: { id } });
    const updated = await BugModel.findByPk(id);
    if (!updated) throw new Error("Bug not found");
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await BugModel.destroy({ where: { id } });
  }

  private toDomain(model: BugModel): Bug {
    return new Bug(
      model.id,
      model.workspaceId,
      model.title,
      model.description,
      model.stepsToReproduce,
      model.expectedBehavior,
      model.actualBehavior,
      model.environment,
      model.severity,
      model.priority,
      model.status,
      model.productId,
      model.featureId,
      model.sprintId,
      model.assigneeId,
      model.reporterId,
      model.tags,
      model.attachments,
      model.resolution,
      model.resolvedAt,
      model.createdAt,
      model.updatedAt
    );
  }
}
