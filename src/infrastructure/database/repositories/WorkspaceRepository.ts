import { IWorkspaceRepository } from '@domain/repositories/IWorkspaceRepository';
import { Workspace } from '@domain/entities/Workspace';
import { WorkspaceModel } from '../models/WorkspaceModel';

export class WorkspaceRepository implements IWorkspaceRepository {
  async create(workspace: Workspace): Promise<Workspace> {
    const created = await WorkspaceModel.create({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      ownerId: workspace.ownerId,
      subscriptionPlan: workspace.subscriptionPlan,
      subscriptionStatus: workspace.subscriptionStatus,
      logoUrl: workspace.logoUrl,
      settings: workspace.settings,
    });

    return this.toDomain(created);
  }

  async findById(id: string): Promise<Workspace | null> {
    const workspace = await WorkspaceModel.findByPk(id);
    return workspace ? this.toDomain(workspace) : null;
  }

  async findBySlug(slug: string): Promise<Workspace | null> {
    const workspace = await WorkspaceModel.findOne({ where: { slug } });
    return workspace ? this.toDomain(workspace) : null;
  }

  async findByUserId(userId: string): Promise<Workspace[]> {
    const workspaces = await WorkspaceModel.findAll({
      where: { ownerId: userId },
    });
    return workspaces.map(w => this.toDomain(w));
  }

  async update(id: string, data: Partial<Workspace>): Promise<Workspace> {
    await WorkspaceModel.update(data, { where: { id } });
    const updated = await WorkspaceModel.findByPk(id);
    if (!updated) throw new Error('Workspace not found');
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await WorkspaceModel.destroy({ where: { id } });
  }

  private toDomain(model: WorkspaceModel): Workspace {
    return new Workspace(
      model.id,
      model.name,
      model.slug,
      model.ownerId,
      model.subscriptionPlan,
      model.subscriptionStatus,
      model.logoUrl,
      model.settings,
      model.createdAt,
      model.updatedAt
    );
  }
}
