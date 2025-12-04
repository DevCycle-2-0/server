import { WorkspaceInvite } from '../entities/WorkspaceInvite';

export interface IWorkspaceInviteRepository {
  findById(id: string): Promise<WorkspaceInvite | null>;
  findByToken(token: string): Promise<WorkspaceInvite | null>;
  findByWorkspace(workspaceId: string): Promise<WorkspaceInvite[]>;
  findPendingByEmail(email: string): Promise<WorkspaceInvite[]>;
  save(invite: WorkspaceInvite): Promise<void>;
  update(invite: WorkspaceInvite): Promise<void>;
  delete(id: string): Promise<void>;
}
