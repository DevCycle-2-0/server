import { IWorkspaceInviteRepository } from '@core/domain/repositories/IWorkspaceInviteRepository';
import { WorkspaceInvite, InviteStatus } from '@core/domain/entities/WorkspaceInvite';
import { UserRole } from '@core/domain/value-objects/Role';
import { WorkspaceInviteModel } from '../models/WorkspaceInviteModel';

export class WorkspaceInviteRepository implements IWorkspaceInviteRepository {
  async findById(id: string): Promise<WorkspaceInvite | null> {
    const model: any = await WorkspaceInviteModel.findByPk(id);
    if (!model) return null;

    return WorkspaceInvite.reconstitute(
      model.id,
      model.workspace_id,
      model.email,
      model.role as UserRole,
      model.invited_by,
      model.status as InviteStatus,
      model.token,
      model.expires_at,
      model.created_at,
      model.updated_at
    );
  }

  async findByToken(token: string): Promise<WorkspaceInvite | null> {
    const model: any = await WorkspaceInviteModel.findOne({ where: { token } });
    if (!model) return null;

    return WorkspaceInvite.reconstitute(
      model.id,
      model.workspace_id,
      model.email,
      model.role as UserRole,
      model.invited_by,
      model.status as InviteStatus,
      model.token,
      model.expires_at,
      model.created_at,
      model.updated_at
    );
  }

  async findByWorkspace(workspaceId: string): Promise<WorkspaceInvite[]> {
    const models = await WorkspaceInviteModel.findAll({
      where: { workspace_id: workspaceId },
      order: [['created_at', 'DESC']],
    });

    return models.map((model: any) =>
      WorkspaceInvite.reconstitute(
        model.id,
        model.workspace_id,
        model.email,
        model.role as UserRole,
        model.invited_by,
        model.status as InviteStatus,
        model.token,
        model.expires_at,
        model.created_at,
        model.updated_at
      )
    );
  }

  async findPendingByEmail(email: string): Promise<WorkspaceInvite[]> {
    const models = await WorkspaceInviteModel.findAll({
      where: {
        email: email.toLowerCase(),
        status: InviteStatus.PENDING,
      },
      order: [['created_at', 'DESC']],
    });

    return models.map((model: any) =>
      WorkspaceInvite.reconstitute(
        model.id,
        model.workspace_id,
        model.email,
        model.role as UserRole,
        model.invited_by,
        model.status as InviteStatus,
        model.token,
        model.expires_at,
        model.created_at,
        model.updated_at
      )
    );
  }

  async save(invite: WorkspaceInvite): Promise<void> {
    await WorkspaceInviteModel.create({
      id: invite.id,
      workspace_id: invite.workspaceId,
      email: invite.email,
      role: invite.role,
      invited_by: invite.invitedBy,
      status: invite.status,
      token: invite.token,
      expires_at: invite.expiresAt,
    });
  }

  async update(invite: WorkspaceInvite): Promise<void> {
    await WorkspaceInviteModel.update(
      {
        status: invite.status,
        updated_at: invite.updatedAt,
      },
      {
        where: { id: invite.id },
      }
    );
  }

  async delete(id: string): Promise<void> {
    await WorkspaceInviteModel.destroy({ where: { id } });
  }
}
