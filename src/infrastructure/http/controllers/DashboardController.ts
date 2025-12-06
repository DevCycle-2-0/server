// src/infrastructure/http/controllers/DashboardController.ts
import { Response, NextFunction } from 'express';
import { FeatureRepository } from '@infrastructure/database/repositories/FeatureRepository';
import { SprintRepository } from '@infrastructure/database/repositories/SprintRepository';
import { TaskRepository } from '@infrastructure/database/repositories/TaskRepository';
import { BugRepository } from '@infrastructure/database/repositories/BugRepository';
import { ReleaseRepository } from '@infrastructure/database/repositories/ReleaseRepository';
import { UserRoleModel } from '@infrastructure/database/models/UserRoleModel';
import { AuthRequest } from '../middleware/auth.middleware';
import { Op } from 'sequelize';

export class DashboardController {
  private featureRepository: FeatureRepository;
  private sprintRepository: SprintRepository;
  private taskRepository: TaskRepository;
  private bugRepository: BugRepository;
  private releaseRepository: ReleaseRepository;

  constructor() {
    this.featureRepository = new FeatureRepository();
    this.sprintRepository = new SprintRepository();
    this.taskRepository = new TaskRepository();
    this.bugRepository = new BugRepository();
    this.releaseRepository = new ReleaseRepository();
  }

  getStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.user!.workspaceId!;

      // Fetch all data in parallel for performance
      const [sprints, tasks, bugs, releases, teamMembers] = await Promise.all([
        this.sprintRepository.findActive(workspaceId),
        this.taskRepository.findByWorkspace(workspaceId),
        this.bugRepository.findByWorkspace(workspaceId),
        this.releaseRepository.findByWorkspace(workspaceId),
        UserRoleModel.findAll({
          where: { workspace_id: workspaceId },
          attributes: ['user_id'],
        }),
      ]);

      // Calculate pending tasks
      const pendingTasks = tasks.filter((t) => !t.isCompleted()).length;

      // Calculate open bugs
      const openBugs = bugs.filter((b) => !b.isResolved()).length;

      // Calculate upcoming releases (in planning or development)
      const upcomingReleases = releases.filter(
        (r) => r.status === 'planning' || r.status === 'development'
      ).length;

      // Calculate team availability
      // For now, we'll use a simple online/offline status
      // In a real app, you'd track this separately
      const totalTeamMembers = teamMembers.length;
      const teamAvailability = {
        available: Math.floor(totalTeamMembers * 0.6), // 60% available
        busy: Math.floor(totalTeamMembers * 0.25), // 25% busy
        away: Math.floor(totalTeamMembers * 0.1), // 10% away
        offline: Math.floor(totalTeamMembers * 0.05), // 5% offline
      };

      // Calculate today's activity
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const tasksCompletedToday = tasks.filter((t) => {
        if (!t.completedAt) return false;
        const completedDate = new Date(t.completedAt);
        return completedDate >= today && completedDate < tomorrow;
      }).length;

      const bugsFixedToday = bugs.filter((b) => {
        if (!b.resolvedAt) return false;
        const resolvedDate = new Date(b.resolvedAt);
        return resolvedDate >= today && resolvedDate < tomorrow;
      }).length;

      const featuresApprovedToday = await this.featureRepository
        .findByWorkspace(workspaceId)
        .then((features) =>
          features.filter((f: any) => {
            if (!f.approvedAt) return false;
            const approvedDate = new Date(f.approvedAt);
            return approvedDate >= today && approvedDate < tomorrow;
          })
        )
        .then((f) => f.length);

      res.json({
        success: true,
        data: {
          activeSprints: sprints.length,
          pendingTasks,
          openBugs,
          upcomingReleases,
          teamAvailability,
          recentActivity: {
            tasksCompletedToday,
            bugsFixedToday,
            featuresApprovedToday,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getActivity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.user!.workspaceId!;
      const { limit = '10', page = '1' } = req.query;

      const limitNum = parseInt(limit as string);
      const pageNum = parseInt(page as string);
      const offset = (pageNum - 1) * limitNum;

      // Fetch recent activities from multiple sources
      const [tasks, bugs, features] = await Promise.all([
        this.taskRepository.findByWorkspace(workspaceId, { limit: 50 }),
        this.bugRepository.findByWorkspace(workspaceId, { limit: 50 }),
        this.featureRepository.findByWorkspace(workspaceId, { limit: 50 }),
      ]);

      // Create activity items
      interface Activity {
        id: string;
        type: 'task' | 'bug' | 'feature';
        action: string;
        title: string;
        userId?: string;
        timestamp: Date;
      }

      const activities: Activity[] = [];

      // Add task activities
      tasks.forEach((task) => {
        if (task.completedAt) {
          activities.push({
            id: task.id,
            type: 'task',
            action: 'completed',
            title: task.title,
            userId: task.assigneeId,
            timestamp: task.completedAt,
          });
        } else {
          activities.push({
            id: task.id,
            type: 'task',
            action: 'created',
            title: task.title,
            userId: task.assigneeId,
            timestamp: task.createdAt,
          });
        }
      });

      // Add bug activities
      bugs.forEach((bug) => {
        if (bug.resolvedAt) {
          activities.push({
            id: bug.id,
            type: 'bug',
            action: 'resolved',
            title: bug.title,
            userId: bug.assigneeId,
            timestamp: bug.resolvedAt,
          });
        } else {
          activities.push({
            id: bug.id,
            type: 'bug',
            action: 'reported',
            title: bug.title,
            userId: bug.reporterId,
            timestamp: bug.createdAt,
          });
        }
      });

      // Add feature activities
      features.forEach((feature: any) => {
        if (feature.completedAt) {
          activities.push({
            id: feature.id,
            type: 'feature',
            action: 'completed',
            title: feature.title,
            userId: feature.assigneeId,
            timestamp: feature.completedAt,
          });
        } else if (feature.approvedAt) {
          activities.push({
            id: feature.id,
            type: 'feature',
            action: 'approved',
            title: feature.title,
            userId: feature.approvedBy,
            timestamp: feature.approvedAt,
          });
        } else {
          activities.push({
            id: feature.id,
            type: 'feature',
            action: 'created',
            title: feature.title,
            userId: undefined,
            timestamp: feature.createdAt,
          });
        }
      });

      // Sort by timestamp (most recent first)
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // Paginate
      const total = activities.length;
      const paginatedActivities = activities.slice(offset, offset + limitNum);

      res.json({
        success: true,
        data: paginatedActivities.map((activity) => ({
          id: activity.id,
          type: activity.type,
          action: activity.action,
          title: activity.title,
          userId: activity.userId,
          timestamp: activity.timestamp,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasNext: offset + limitNum < total,
          hasPrev: pageNum > 1,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getSprintSummary = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.user!.workspaceId!;

      // Get active sprints
      const sprints = await this.sprintRepository.findActive(workspaceId);

      if (sprints.length === 0) {
        res.json({
          success: true,
          data: {
            activeSprints: [],
          },
        });
        return;
      }

      // Fetch all sprint IDs
      const sprintIds = sprints.map((s) => s.id);

      // Fetch all tasks for all sprints at once
      const allTasks = await this.taskRepository.findByWorkspace(workspaceId);

      // Filter tasks by sprint
      const tasksBySprint = new Map<string, typeof allTasks>();
      allTasks.forEach((task) => {
        if (task.sprintId && sprintIds.includes(task.sprintId)) {
          const existing = tasksBySprint.get(task.sprintId) || [];
          existing.push(task);
          tasksBySprint.set(task.sprintId, existing);
        }
      });

      // Get team member counts per sprint
      const teamMembersBySprint = new Map<string, Set<string>>();
      allTasks.forEach((task) => {
        if (task.sprintId && task.assigneeId && sprintIds.includes(task.sprintId)) {
          if (!teamMembersBySprint.has(task.sprintId)) {
            teamMembersBySprint.set(task.sprintId, new Set());
          }
          teamMembersBySprint.get(task.sprintId)!.add(task.assigneeId);
        }
      });

      // Build sprint summaries
      const sprintSummaries = sprints.map((sprint) => {
        const tasks = tasksBySprint.get(sprint.id) || [];
        const completed = tasks.filter((t) => t.isCompleted()).length;
        const teamMembers = teamMembersBySprint.get(sprint.id)?.size || 0;

        return {
          id: sprint.id,
          name: sprint.name,
          progress: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
          tasksTotal: tasks.length,
          tasksCompleted: completed,
          daysRemaining: sprint.getDaysRemaining(),
          velocity: sprint.velocity,
          teamMembers,
        };
      });

      res.json({
        success: true,
        data: {
          activeSprints: sprintSummaries,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
