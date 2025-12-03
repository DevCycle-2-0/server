import { IWorkspaceRepository } from '@core/domain/repositories/IWorkspaceRepository';
import { Workspace } from '@core/domain/entities/Workspace';
import { WorkspaceModel } from '../models/WorkspaceModel';

export class WorkspaceRepository implements IWorkspaceRepository {
  async findById(id: string): Promise<Workspace | null> {
    const model = await WorkspaceModel.findByPk(id);
    if (!model) return null;

    return Workspace.reconstitute(
      model.id,
      model.name,
      model.slug,
      model.owner_id,
      model.settings,
      model.created_at,
      model.updated_at
    );
  }

  async findBySlug(slug: string): Promise<Workspace | null> {
    const model = await WorkspaceModel.findOne({ where: { slug } });
    if (!model) return null;

    return Workspace.reconstitute(
      model.id,
      model.name,
      model.slug,
      model.owner_id,
      model.settings,
      model.created_at,
      model.updated_at
    );
  }

  async save(workspace: Workspace): Promise<void> {
    await WorkspaceModel.create({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      owner_id: workspace.ownerId,
      settings: workspace.settings,
    });
  }

  async update(workspace: Workspace): Promise<void> {
    await WorkspaceModel.update(
      {
        name: workspace.name,
        settings: workspace.settings,
        updated_at: workspace.updatedAt,
      },
      {
        where: { id: workspace.id },
      }
    );
  }

  async delete(id: string): Promise<void> {
    await WorkspaceModel.destroy({ where: { id } });
  }
}
