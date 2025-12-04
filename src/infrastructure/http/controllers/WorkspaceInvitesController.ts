import { Response, NextFunction } from 'express';
import { WorkspaceInvite, InviteStatus } from '@core/domain/entities/WorkspaceInvite';
import { WorkspaceInviteRepository } from '@infrastructure/database/repositories/WorkspaceInviteRepository';
import { UserRepository } from '@infrastructure/database/repositories/UserRepository';
import { WorkspaceRepository } from '@infrastructure/database/repositories/WorkspaceRepository';
import { UserRoleModel } from '@infrastructure/database/models/UserRoleModel';
import { ConsoleEmailService } from '@core/application/services/EmailService';
import { UserRole } from '@core/domain/value-objects/Role';
import { AuthRequest } from '../middleware/auth.middleware';

export class WorkspaceInvitesController {
  private inviteRepository: WorkspaceInviteRepository;
  private userRepository: UserRepository;
  private workspaceRepository: WorkspaceRepository;
  private emailService: ConsoleEmailService;

  constructor() {
    this.inviteRepository = new WorkspaceInviteRepository();
    this.userRepository = new UserRepository();
    this.workspaceRepository = new WorkspaceRepository();
    this.emailService = new ConsoleEmailService();
  }

  /**
   * POST /workspaces/:id/invites
   * Invite user to workspace
   */
  inviteUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id: workspaceId } = req.params;
      const { email, role } = req.body;
      const invitedBy = req.user!.sub;

      // Validate workspace exists
      const workspace = await this.workspaceRepository.findById(workspaceId);
      if (!workspace) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Workspace not found' },
        });
        return;
      }

      // Check if user is already a member
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser && existingUser.workspaceId === workspaceId) {
        res.status(409).json({
          success: false,
          error: { code: 'ALREADY_MEMBER', message: 'User is already a workspace member' },
        });
        return;
      }

      // Check for pending invite
      const pendingInvites = await this.inviteRepository.findPendingByEmail(email);
      const existingInvite = pendingInvites.find((inv) => inv.workspaceId === workspaceId);
      if (existingInvite) {
        res.status(409).json({
          success: false,
          error: { code: 'INVITE_EXISTS', message: 'Pending invite already exists' },
        });
        return;
      }

      // Create invite
      const invite = WorkspaceInvite.create(workspaceId, email, role as UserRole, invitedBy);
      await this.inviteRepository.save(invite);

      // Send invite email
      await this.emailService.sendInviteEmail(email, workspace.name, invite.token);

      res.status(200).json({
        success: true,
        data: {
          id: invite.id,
          email: invite.email,
          role: invite.role,
          status: invite.status,
          expiresAt: invite.expiresAt,
          createdAt: invite.createdAt,
        },
        message: 'Invitation sent successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /workspaces/:id/invites
   * List workspace invites
   */
  listInvites = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id: workspaceId } = req.params;

      const invites = await this.inviteRepository.findByWorkspace(workspaceId);

      res.json({
        success: true,
        data: invites.map((inv) => ({
          id: inv.id,
          email: inv.email,
          role: inv.role,
          status: inv.status,
          invitedBy: inv.invitedBy,
          expiresAt: inv.expiresAt,
          createdAt: inv.createdAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /workspaces/invites/accept
   * Accept workspace invite
   */
  acceptInvite = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.body;
      const userId = req.user!.sub;

      // Find invite
      const invite = await this.inviteRepository.findByToken(token);
      if (!invite) {
        res.status(404).json({
          success: false,
          error: { code: 'INVALID_TOKEN', message: 'Invalid or expired invite' },
        });
        return;
      }

      // Check if expired
      if (invite.isExpired()) {
        invite.markExpired();
        await this.inviteRepository.update(invite);

        res.status(400).json({
          success: false,
          error: { code: 'INVITE_EXPIRED', message: 'Invite has expired' },
        });
        return;
      }

      // Get user and workspace
      const user = await this.userRepository.findById(userId);
      const workspace = await this.workspaceRepository.findById(invite.workspaceId);

      if (!user || !workspace) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User or workspace not found' },
        });
        return;
      }

      // Accept invite
      invite.accept();
      await this.inviteRepository.update(invite);

      // Update user workspace
      user.joinWorkspace(workspace.id);
      await this.userRepository.update(user);

      // Assign role
      await UserRoleModel.create({
        user_id: userId,
        workspace_id: workspace.id,
        role: invite.role,
      });

      res.json({
        success: true,
        data: {
          workspaceId: workspace.id,
          workspaceName: workspace.name,
          role: invite.role,
        },
        message: 'Invite accepted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /workspaces/invites/:inviteId
   * Cancel workspace invite
   */
  cancelInvite = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { inviteId } = req.params;

      const invite = await this.inviteRepository.findById(inviteId);
      if (!invite) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Invite not found' },
        });
        return;
      }

      invite.cancel();
      await this.inviteRepository.update(invite);

      res.json({
        success: true,
        message: 'Invite cancelled successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /workspaces/:id/members/:userId
   * Remove member from workspace
   */
  removeMember = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id: workspaceId, userId } = req.params;
      const requesterId = req.user!.sub;

      // Cannot remove self
      if (userId === requesterId) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Cannot remove yourself' },
        });
        return;
      }

      // Get workspace
      const workspace = await this.workspaceRepository.findById(workspaceId);
      if (!workspace) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Workspace not found' },
        });
        return;
      }

      // Cannot remove owner
      if (workspace.ownerId === userId) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Cannot remove workspace owner' },
        });
        return;
      }

      // Get user
      const user = await this.userRepository.findById(userId);
      if (!user || user.workspaceId !== workspaceId) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User not found in workspace' },
        });
        return;
      }

      // Remove user from workspace
      user.joinWorkspace(''); // Clear workspace
      await this.userRepository.update(user);

      // Delete user role
      await UserRoleModel.destroy({
        where: {
          user_id: userId,
          workspace_id: workspaceId,
        },
      });

      res.json({
        success: true,
        message: 'Member removed successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /workspaces/:id/members/:userId/role
   * Update member role
   */
  updateMemberRole = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id: workspaceId, userId } = req.params;
      const { role } = req.body;
      const requesterId = req.user!.sub;

      // Cannot change own role
      if (userId === requesterId) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Cannot change your own role' },
        });
        return;
      }

      // Get workspace
      const workspace = await this.workspaceRepository.findById(workspaceId);
      if (!workspace) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Workspace not found' },
        });
        return;
      }

      // Cannot change owner role
      if (workspace.ownerId === userId) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Cannot change owner role' },
        });
        return;
      }

      // Update role
      const [updated] = await UserRoleModel.update(
        { role },
        {
          where: {
            user_id: userId,
            workspace_id: workspaceId,
          },
        }
      );

      if (updated === 0) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User role not found' },
        });
        return;
      }

      res.json({
        success: true,
        message: 'Member role updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /workspaces/:id/members
   * List workspace members
   */
  listMembers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id: workspaceId } = req.params;

      // Get all user roles for workspace
      const roles = await UserRoleModel.findAll({
        where: { workspace_id: workspaceId },
        include: [
          {
            association: 'user',
            attributes: ['id', 'name', 'email', 'avatar', 'created_at'],
          },
        ],
      });

      res.json({
        success: true,
        data: roles.map((r: any) => ({
          id: r.user.id,
          name: r.user.name,
          email: r.user.email,
          avatar: r.user.avatar,
          role: r.role,
          joinedAt: r.created_at,
        })),
      });
    } catch (error) {
      next(error);
    }
  };
}
