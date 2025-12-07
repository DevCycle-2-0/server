import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { UserModel } from '@infrastructure/database/models/UserModel';
import { TaskModel } from '@infrastructure/database/models/TaskModel';
import { SprintModel } from '@infrastructure/database/models/SprintModel';
import { successResponse } from '@shared/utils/response';
import {
  getPaginationParams,
  getPaginationMeta,
} from '@shared/utils/pagination';
import { NotFoundError } from '@shared/errors/AppError';
import { ItemStatus } from '@shared/types';

export class TeamController {
  listMembers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { workspaceId } = req.params;
      const { page, limit, search } = req.query;

      const { page: p, limit: l } = getPaginationParams(page, limit);
      const offset = (p - 1) * l;

      // For now, get all users (in production, filter by workspace membership)
      const where: any = {};
      if (search) {
        where.$or = [
          { fullName: { $iLike: `%${search}%` } },
          { email: { $iLike: `%${search}%` } },
        ];
      }

      const { rows, count } = await UserModel.findAndCountAll({
        where,
        limit: l,
        offset,
        order: [['fullName', 'ASC']],
      });

      const membersWithStats = await Promise.all(
        rows.map(async user => {
          const assignedTasks = await TaskModel.count({
            where: { assigneeId: user.id },
          });

          return {
            id: user.id,
            email: user.email,
            full_name: user.fullName,
            avatar_url: user.avatarUrl,
            role: 'member',
            title: null,
            department: null,
            skills: [],
            workload: {
              assigned_points: 0,
              capacity_points: 15,
              utilization_percentage: 0,
            },
            availability: {
              status: 'available',
              hours_per_week: 40,
            },
            joined_at: user.createdAt,
          };
        })
      );

      const meta = getPaginationMeta(p, l, count);
      res.json(successResponse(membersWithStats, meta));
    } catch (error) {
      next(error);
    }
  };

  getMemberProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;

      const user = await UserModel.findByPk(id);
      if (!user) {
        throw new NotFoundError('Member not found');
      }

      // Get member stats
      const tasksCompleted30d = await TaskModel.count({
        where: {
          assigneeId: user.id,
          status: ItemStatus.DONE,
          completedAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      });

      res.json(
        successResponse({
          id: user.id,
          email: user.email,
          full_name: user.fullName,
          avatar_url: user.avatarUrl,
          role: 'member',
          title: null,
          department: null,
          bio: null,
          timezone: user.timezone,
          skills: [],
          contact: {},
          workload: {
            current_sprint: {
              assigned_points: 0,
              completed_points: 0,
              tasks_count: 0,
              tasks_completed: 0,
            },
            capacity_points: 15,
            utilization_percentage: 0,
          },
          availability: {
            status: 'available',
            hours_per_week: 40,
            working_hours: {
              start: '09:00',
              end: '17:00',
              timezone: user.timezone,
            },
            time_off: [],
          },
          stats: {
            tasks_completed_30d: tasksCompleted30d,
            points_delivered_30d: 0,
            bugs_fixed_30d: 0,
            avg_task_completion_days: 0,
          },
          recent_activity: [],
          joined_at: user.createdAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  updateMemberProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { title, department, bio, skills } = req.body;

      const user = await UserModel.findByPk(id);
      if (!user) {
        throw new NotFoundError('Member not found');
      }

      // In a real implementation, store these in a user_profiles table
      res.json(
        successResponse({
          id: user.id,
          title,
          department,
          bio,
          skills,
          updated_at: new Date(),
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getMemberWorkload = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { period } = req.query;

      const user = await UserModel.findByPk(id);
      if (!user) {
        throw new NotFoundError('Member not found');
      }

      // Get active sprint
      const activeSprint = await SprintModel.findOne({
        where: { status: 'active' },
        order: [['startDate', 'DESC']],
      });

      const tasks = await TaskModel.findAll({
        where: {
          assigneeId: user.id,
          ...(activeSprint && { sprintId: activeSprint.id }),
        },
        include: ['feature', 'sprint'],
      });

      const totalPoints = tasks.reduce(
        (sum, t) => sum + (t.storyPoints || 0),
        0
      );
      const completedPoints = tasks
        .filter(t => t.status === ItemStatus.DONE)
        .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

      res.json(
        successResponse({
          member_id: user.id,
          full_name: user.fullName,
          period: period || 'current_sprint',
          sprint: activeSprint
            ? {
                id: activeSprint.id,
                name: activeSprint.name,
                start_date: activeSprint.startDate,
                end_date: activeSprint.endDate,
              }
            : null,
          summary: {
            capacity_points: 15,
            assigned_points: totalPoints,
            completed_points: completedPoints,
            remaining_points: totalPoints - completedPoints,
            utilization_percentage: (totalPoints / 15) * 100,
          },
          items: {
            features: [],
            tasks: tasks.map(t => ({
              id: t.id,
              title: t.title,
              story_points: t.storyPoints,
              status: t.status,
            })),
            bugs: [],
          },
          time_tracking: {
            logged_hours: tasks.reduce(
              (sum, t) => sum + Number(t.loggedHours),
              0
            ),
            expected_hours: 0,
            by_day: [],
          },
          burndown: [],
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getTeamWorkload = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { workspaceId } = req.params;
      const { sprint_id, product_id } = req.query;

      const users = await UserModel.findAll({
        limit: 10,
      });

      const membersWorkload = await Promise.all(
        users.map(async user => {
          const tasks = await TaskModel.findAll({
            where: { assigneeId: user.id },
          });

          const assigned = tasks.reduce(
            (sum, t) => sum + (t.storyPoints || 0),
            0
          );
          const completed = tasks
            .filter(t => t.status === ItemStatus.DONE)
            .reduce((sum, t) => sum + (t.storyPoints || 0), 0);
          const capacity = 15;

          return {
            id: user.id,
            full_name: user.fullName,
            avatar_url: user.avatarUrl,
            capacity,
            assigned,
            completed,
            utilization: (assigned / capacity) * 100,
            status: assigned > capacity ? 'overloaded' : 'on_track',
          };
        })
      );

      const totalCapacity = membersWorkload.reduce(
        (sum, m) => sum + m.capacity,
        0
      );
      const totalAssigned = membersWorkload.reduce(
        (sum, m) => sum + m.assigned,
        0
      );
      const totalCompleted = membersWorkload.reduce(
        (sum, m) => sum + m.completed,
        0
      );

      res.json(
        successResponse({
          sprint: null,
          summary: {
            total_capacity: totalCapacity,
            total_assigned: totalAssigned,
            total_completed: totalCompleted,
            team_utilization: (totalAssigned / totalCapacity) * 100,
            on_track: totalCompleted >= totalAssigned * 0.5,
          },
          members: membersWorkload,
          distribution: {
            by_status: {
              todo: 0,
              in_progress: 0,
              done: totalCompleted,
            },
            by_type: {
              features: 0,
              tasks: totalAssigned,
              bugs: 0,
            },
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  listSkills = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Placeholder - would need a skills table in production
      res.json(
        successResponse([
          {
            name: 'React',
            count: 4,
            members: [],
          },
          {
            name: 'TypeScript',
            count: 4,
            members: [],
          },
          {
            name: 'Node.js',
            count: 2,
            members: [],
          },
        ])
      );
    } catch (error) {
      next(error);
    }
  };

  addSkill = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { name, level } = req.body;

      res.status(201).json(
        successResponse({
          skill: { name, level },
          updated_at: new Date(),
        })
      );
    } catch (error) {
      next(error);
    }
  };
}
