import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { WorkspaceModel } from '@infrastructure/database/models/WorkspaceModel';
import { WorkspaceMemberModel } from '@infrastructure/database/models/WorkspaceMemberModel';
import {
  WorkspaceInviteModel,
  InviteStatus,
} from '@infrastructure/database/models/WorkspaceInviteModel';
import { UserModel } from '@infrastructure/database/models/UserModel';
import { successResponse } from '@shared/utils/response';
import {
  NotFoundError,
  ConflictError,
  ValidationError,
} from '@shared/errors/AppError';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import {
  getPaginationParams,
  getPaginationMeta,
} from '@shared/utils/pagination';

export class WorkspaceController {
  list = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Get workspaces where user is owner or member
      const ownedWorkspaces = await WorkspaceModel.findAll({
        where: { ownerId: req.user!.userId },
      });

      const memberWorkspaces = await WorkspaceMemberModel.findAll({
        where: { userId: req.user!.userId },
        include: ['workspace'],
      });

      const allWorkspaces = [
        ...ownedWorkspaces.map(w => ({
          workspace: w,
          role: 'owner' as const,
        })),
        ...memberWorkspaces.map(m => ({
          workspace: m.workspace,
          role: m.role,
        })),
      ];

      const workspacesWithStats = await Promise.all(
        allWorkspaces.map(async ({ workspace, role }) => {
          const memberCount = await WorkspaceMemberModel.count({
            where: { workspaceId: workspace.id },
          });

          return {
            id: workspace.id,
            name: workspace.name,
            slug: workspace.slug,
            logo_url: workspace.logoUrl,
            role,
            member_count: memberCount + 1, // +1 for owner
            subscription_plan: workspace.subscriptionPlan,
            created_at: workspace.createdAt,
          };
        })
      );

      res.json(successResponse(workspacesWithStats));
    } catch (error) {
      next(error);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { name, slug } = req.body;

      let workspaceSlug = slug;
      if (!workspaceSlug) {
        workspaceSlug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      }

      const existing = await WorkspaceModel.findOne({
        where: { slug: workspaceSlug },
      });

      if (existing) {
        throw new ConflictError('Workspace slug already taken', 'SLUG_EXISTS');
      }

      const workspace = await WorkspaceModel.create({
        id: uuidv4(),
        name,
        slug: workspaceSlug,
        ownerId: req.user!.userId,
      });

      res.status(201).json(
        successResponse({
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          logo_url: workspace.logoUrl,
          owner_id: workspace.ownerId,
          subscription_plan: workspace.subscriptionPlan,
          settings: workspace.settings,
          created_at: workspace.createdAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const workspace = await WorkspaceModel.findByPk(req.params.id);

      if (!workspace) {
        throw new NotFoundError('Workspace not found');
      }

      const memberCount = await WorkspaceMemberModel.count({
        where: { workspaceId: workspace.id },
      });

      res.json(
        successResponse({
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          logo_url: workspace.logoUrl,
          owner_id: workspace.ownerId,
          subscription_plan: workspace.subscriptionPlan,
          subscription_status: workspace.subscriptionStatus,
          settings: workspace.settings,
          stats: {
            member_count: memberCount + 1,
            product_count: 0,
            active_features: 0,
            active_sprints: 0,
          },
          created_at: workspace.createdAt,
          updated_at: workspace.updatedAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const workspace = await WorkspaceModel.findByPk(req.params.id);

      if (!workspace) {
        throw new NotFoundError('Workspace not found');
      }

      await workspace.update(req.body);

      res.json(
        successResponse({
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          logo_url: workspace.logoUrl,
          settings: workspace.settings,
          updated_at: workspace.updatedAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const workspace = await WorkspaceModel.findByPk(req.params.id);

      if (!workspace) {
        throw new NotFoundError('Workspace not found');
      }

      if (workspace.ownerId !== req.user!.userId) {
        throw new ValidationError('Only owner can delete workspace');
      }

      await workspace.destroy();

      res.json(successResponse({ message: 'Workspace deleted successfully' }));
    } catch (error) {
      next(error);
    }
  };

  listMembers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { page, limit, search, role } = req.query;

      const { page: p, limit: l } = getPaginationParams(page, limit);
      const offset = (p - 1) * l;

      const where: any = { workspaceId: id };
      if (role) where.role = role;

      const { rows, count } = await WorkspaceMemberModel.findAndCountAll({
        where,
        include: [
          {
            model: UserModel,
            as: 'user',
            ...(search && {
              where: {
                $or: [
                  { fullName: { $iLike: `%${search}%` } },
                  { email: { $iLike: `%${search}%` } },
                ],
              },
            }),
          },
        ],
        limit: l,
        offset,
        order: [['joinedAt', 'ASC']],
      });

      const members = rows.map(member => ({
        id: member.user.id,
        email: member.user.email,
        full_name: member.user.fullName,
        avatar_url: member.user.avatarUrl,
        role: member.role,
        joined_at: member.joinedAt,
      }));

      // Add workspace owner
      const workspace = await WorkspaceModel.findByPk(id, {
        include: ['owner'],
      });

      if (workspace) {
        members.unshift({
          id: workspace.owner.id,
          email: workspace.owner.email,
          full_name: workspace.owner.fullName,
          avatar_url: workspace.owner.avatarUrl,
          role: 'owner',
          joined_at: workspace.createdAt,
        });
      }

      const meta = getPaginationMeta(p, l, count + 1); // +1 for owner
      res.json(successResponse(members, meta));
    } catch (error) {
      next(error);
    }
  };

  updateMemberRole = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id, userId } = req.params;
      const { role } = req.body;

      const workspace = await WorkspaceModel.findByPk(id);
      if (!workspace) {
        throw new NotFoundError('Workspace not found');
      }

      if (workspace.ownerId === userId) {
        throw new ValidationError('Cannot change owner role');
      }

      const member = await WorkspaceMemberModel.findOne({
        where: { workspaceId: id, userId },
      });

      if (!member) {
        throw new NotFoundError('Member not found');
      }

      member.role = role;
      await member.save();

      const user = await UserModel.findByPk(userId);

      res.json(
        successResponse({
          id: user!.id,
          email: user!.email,
          full_name: user!.fullName,
          role: member.role,
          updated_at: member.updatedAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  removeMember = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id, userId } = req.params;

      const workspace = await WorkspaceModel.findByPk(id);
      if (!workspace) {
        throw new NotFoundError('Workspace not found');
      }

      if (workspace.ownerId === userId) {
        throw new ValidationError('Cannot remove workspace owner');
      }

      if (userId === req.user!.userId) {
        throw new ValidationError('Use leave endpoint to remove yourself');
      }

      await WorkspaceMemberModel.destroy({
        where: { workspaceId: id, userId },
      });

      res.json(successResponse({ message: 'Member removed successfully' }));
    } catch (error) {
      next(error);
    }
  };

  inviteMember = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { email, role } = req.body;

      // Check if user already a member
      const existingUser = await UserModel.findOne({ where: { email } });
      if (existingUser) {
        const existingMember = await WorkspaceMemberModel.findOne({
          where: { workspaceId: id, userId: existingUser.id },
        });
        if (existingMember) {
          throw new ConflictError('User is already a member');
        }
      }

      // Check if pending invite exists
      const existingInvite = await WorkspaceInviteModel.findOne({
        where: { workspaceId: id, email, status: InviteStatus.PENDING },
      });
      if (existingInvite) {
        throw new ConflictError('Pending invite already exists');
      }

      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const invite = await WorkspaceInviteModel.create({
        id: uuidv4(),
        workspaceId: id,
        email,
        role,
        token,
        invitedBy: req.user!.userId,
        expiresAt,
      });

      const inviter = await UserModel.findByPk(req.user!.userId);

      res.status(201).json(
        successResponse({
          id: invite.id,
          email: invite.email,
          role: invite.role,
          status: invite.status,
          invited_by: {
            id: inviter!.id,
            full_name: inviter!.fullName,
          },
          expires_at: invite.expiresAt,
          created_at: invite.createdAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  listInvites = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const invites = await WorkspaceInviteModel.findAll({
        where: { workspaceId: id, status: InviteStatus.PENDING },
        include: ['inviter'],
        order: [['createdAt', 'DESC']],
      });

      res.json(
        successResponse(
          invites.map(invite => ({
            id: invite.id,
            email: invite.email,
            role: invite.role,
            status: invite.status,
            invited_by: {
              id: invite.inviter.id,
              full_name: invite.inviter.fullName,
            },
            expires_at: invite.expiresAt,
            created_at: invite.createdAt,
          }))
        )
      );
    } catch (error) {
      next(error);
    }
  };

  cancelInvite = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id, inviteId } = req.params;

      const invite = await WorkspaceInviteModel.findOne({
        where: { id: inviteId, workspaceId: id },
      });

      if (!invite) {
        throw new NotFoundError('Invitation not found');
      }

      invite.status = InviteStatus.CANCELLED;
      await invite.save();

      res.json(successResponse({ message: 'Invitation cancelled' }));
    } catch (error) {
      next(error);
    }
  };

  acceptInvite = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { token } = req.body;

      const invite = await WorkspaceInviteModel.findOne({
        where: { token, status: InviteStatus.PENDING },
        include: ['workspace'],
      });

      if (!invite) {
        throw new ValidationError('Invalid or expired invitation token');
      }

      if (new Date() > invite.expiresAt) {
        invite.status = InviteStatus.EXPIRED;
        await invite.save();
        throw new ValidationError('Invitation has expired');
      }

      // Check if user email matches
      const user = await UserModel.findByPk(req.user!.userId);
      if (user!.email !== invite.email) {
        throw new ValidationError('This invitation is for a different email');
      }

      // Check if already a member
      const existingMember = await WorkspaceMemberModel.findOne({
        where: { workspaceId: invite.workspaceId, userId: req.user!.userId },
      });

      if (existingMember) {
        throw new ConflictError('Already a member of this workspace');
      }

      // Create membership
      await WorkspaceMemberModel.create({
        id: uuidv4(),
        workspaceId: invite.workspaceId,
        userId: req.user!.userId,
        role: invite.role,
      });

      // Update invite status
      invite.status = InviteStatus.ACCEPTED;
      await invite.save();

      res.json(
        successResponse({
          workspace: {
            id: invite.workspace.id,
            name: invite.workspace.name,
            slug: invite.workspace.slug,
          },
          role: invite.role,
        })
      );
    } catch (error) {
      next(error);
    }
  };
}
