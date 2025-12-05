import { Response, NextFunction } from 'express';
import { ProductRepository } from '@infrastructure/database/repositories/ProductRepository';
import { FeatureRepository } from '@infrastructure/database/repositories/FeatureRepository';
import { SprintRepository } from '@infrastructure/database/repositories/SprintRepository';
import { TaskRepository } from '@infrastructure/database/repositories/TaskRepository';
import { BugRepository } from '@infrastructure/database/repositories/BugRepository';
import { AuthRequest } from '../middleware/auth.middleware';
import { SprintModel } from '@infrastructure/database/models/SprintModel';
import { Op } from 'sequelize';
import { ReleaseRepository } from '@infrastructure/database/repositories/ReleaseRepository';
import { TimeLog } from '@core/domain/entities/TimeLog';
import { TimeLogRepository } from '@infrastructure/database/repositories/TimeLogRepository';

export class AnalyticsController {
  private productRepository: ProductRepository;
  private featureRepository: FeatureRepository;
  private sprintRepository: SprintRepository;
  private taskRepository: TaskRepository;
  private bugRepository: BugRepository;
  private releaseRepository: ReleaseRepository;
  private timeLogRepository: TimeLogRepository;

  constructor() {
    this.productRepository = new ProductRepository();
    this.featureRepository = new FeatureRepository();
    this.sprintRepository = new SprintRepository();
    this.taskRepository = new TaskRepository();
    this.bugRepository = new BugRepository();
    this.releaseRepository = new ReleaseRepository();
    this.timeLogRepository = new TimeLogRepository();
  }

  getOverview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.user!.workspaceId!;
      const { startDate, endDate } = req.query;

      // Build date filter
      const dateFilter: any = {};
      if (startDate) {
        dateFilter.createdAt = { [Op.gte]: new Date(startDate as string) };
      }
      if (endDate) {
        dateFilter.createdAt = {
          ...dateFilter.createdAt,
          [Op.lte]: new Date(endDate as string),
        };
      }

      // Fetch data with date filters
      const features = await this.featureRepository.findByWorkspace(workspaceId, dateFilter);
      const sprints = await this.sprintRepository.findByProduct(workspaceId); // Need findByWorkspace
      const tasks = await this.taskRepository.findByWorkspace(workspaceId, dateFilter);
      const bugs = await this.bugRepository.findByWorkspace(workspaceId, dateFilter);

      // Calculate real metrics
      const completedFeatures = features.filter((f) => f.isCompleted()).length;
      const completedTasks = tasks.filter((t) => t.isCompleted()).length;
      const openBugs = bugs.filter((b) => !b.isResolved()).length;
      const criticalBugs = bugs.filter((b) => b.isBlocking()).length;

      // Calculate actual average resolution time
      const resolvedBugs = bugs.filter((b) => b.resolvedAt);
      const avgResolutionTime =
        resolvedBugs.length > 0
          ? resolvedBugs.reduce((sum, bug) => {
              const resolutionTime =
                (new Date(bug.resolvedAt!).getTime() - new Date(bug.createdAt).getTime()) /
                (1000 * 60 * 60); // Convert to hours
              return sum + resolutionTime;
            }, 0) / resolvedBugs.length
          : 0;

      // Calculate completed sprints
      const allSprints = await SprintModel.findAll({
        where: {
          workspace_id: workspaceId,
          status: 'completed',
          ...(startDate && {
            end_date: { [Op.gte]: new Date(startDate as string) },
          }),
          ...(endDate && {
            end_date: { [Op.lte]: new Date(endDate as string) },
          }),
        },
      });

      // Calculate overdue tasks
      const overdueTasks = tasks.filter((t: any) => {
        // Assuming you add a dueDate field to Task entity
        return t.dueDate && new Date(t.dueDate) < new Date() && !t.isCompleted();
      }).length;

      res.json({
        success: true,
        data: {
          features: {
            total: features.length,
            completed: completedFeatures,
            inProgress: features.length - completedFeatures,
            completionRate:
              features.length > 0 ? Math.round((completedFeatures / features.length) * 100) : 0,
          },
          sprints: {
            active: sprints.filter((s) => s.isActive()).length,
            completed: allSprints.length,
            averageVelocity:
              allSprints.length > 0
                ? Math.round(allSprints.reduce((sum, s) => sum + s.velocity, 0) / allSprints.length)
                : 0,
          },
          tasks: {
            total: tasks.length,
            completed: completedTasks,
            overdue: overdueTasks,
          },
          bugs: {
            open: openBugs,
            critical: criticalBugs,
            averageResolutionTime: Math.round(avgResolutionTime * 10) / 10,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getVelocity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.user!.workspaceId!;
      const { limit = 10 } = req.query;

      // Get completed sprints ordered by end date
      const sprints = await SprintModel.findAll({
        where: {
          workspace_id: workspaceId,
          status: { [Op.in]: ['completed', 'active'] },
        },
        order: [['end_date', 'DESC']],
        limit: Number(limit),
      });

      const velocityData = await Promise.all(
        sprints.map(async (sprintModel: any) => {
          const sprint = await this.sprintRepository.findById(sprintModel.id);
          if (!sprint) return null;

          const tasks = await this.taskRepository.findBySprint(sprint.id);

          // Calculate planned and completed story points
          const plannedPoints = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
          const completedPoints = tasks
            .filter((t) => t.isCompleted())
            .reduce((sum, t) => sum + (t.estimatedHours || 0), 0);

          return {
            sprintId: sprint.id,
            sprintName: sprint.name,
            planned: plannedPoints,
            completed: completedPoints,
            velocity: sprint.velocity,
          };
        })
      );

      res.json({
        success: true,
        data: velocityData.filter(Boolean),
      });
    } catch (error) {
      next(error);
    }
  };

  getBurndown = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sprintId } = req.query;

      if (!sprintId) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'sprintId required' },
        });
        return;
      }

      const sprint = await this.sprintRepository.findById(sprintId as string);
      if (!sprint) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Sprint not found' },
        });
        return;
      }

      const tasks = await this.taskRepository.findBySprint(sprintId as string);
      const totalPoints = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);

      // Calculate burndown for each day
      const startDate = new Date(sprint.startDate);
      const endDate = new Date(sprint.endDate);
      const totalDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const idealBurnRate = totalPoints / totalDays;

      const days = [];
      for (let day = 0; day <= totalDays; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + day);

        // Calculate remaining points (tasks completed before this date)
        const completedPoints = tasks
          .filter((t) => t.completedAt && new Date(t.completedAt) <= currentDate)
          .reduce((sum, t) => sum + (t.estimatedHours || 0), 0);

        const remainingPoints = totalPoints - completedPoints;

        // Calculate tasks completed today
        const completedToday = tasks
          .filter((t) => {
            if (!t.completedAt) return false;
            const completedDate = new Date(t.completedAt);
            return completedDate.toDateString() === currentDate.toDateString();
          })
          .reduce((sum, t) => sum + (t.estimatedHours || 0), 0);

        days.push({
          date: currentDate.toISOString().split('T')[0],
          remainingPoints: Math.round(remainingPoints),
          idealRemaining: Math.round(totalPoints - idealBurnRate * day),
          completedToday: Math.round(completedToday),
        });
      }

      res.json({
        success: true,
        data: {
          sprintId: sprint.id,
          totalPoints: Math.round(totalPoints),
          days,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getBugResolution = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.user!.workspaceId!;
      const { startDate, endDate, productId } = req.query;

      const bugs = await this.bugRepository.findByWorkspace(workspaceId, {
        productId,
        resolvedAfter: startDate ? new Date(startDate as string) : undefined,
        resolvedBefore: endDate ? new Date(endDate as string) : undefined,
      });

      const resolvedBugs = bugs.filter((b) => b.resolvedAt);

      // Calculate resolution times
      const resolutionTimes = resolvedBugs.map((bug) => {
        const created = new Date(bug.createdAt).getTime();
        const resolved = new Date(bug.resolvedAt!).getTime();
        return (resolved - created) / (1000 * 60 * 60); // hours
      });

      const averageResolutionTime =
        resolutionTimes.length > 0
          ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
          : 0;

      // Calculate median
      const sortedTimes = [...resolutionTimes].sort((a, b) => a - b);
      const medianResolutionTime =
        sortedTimes.length > 0 ? sortedTimes[Math.floor(sortedTimes.length / 2)] : 0;

      // Group by severity
      const bySeverity = {
        critical: { avg: 0, count: 0 },
        major: { avg: 0, count: 0 },
        minor: { avg: 0, count: 0 },
        blocker: { avg: 0, count: 0 },
      };

      resolvedBugs.forEach((bug) => {
        const severity = bug.severity as keyof typeof bySeverity;
        if (bySeverity[severity]) {
          const created = new Date(bug.createdAt).getTime();
          const resolved = new Date(bug.resolvedAt!).getTime();
          const hours = (resolved - created) / (1000 * 60 * 60);

          bySeverity[severity].count += 1;
          bySeverity[severity].avg += hours;
        }
      });

      // Calculate averages
      Object.keys(bySeverity).forEach((severity) => {
        const key = severity as keyof typeof bySeverity;
        if (bySeverity[key].count > 0) {
          bySeverity[key].avg = Math.round(bySeverity[key].avg / bySeverity[key].count);
        }
      });

      // Calculate monthly trend (last 6 months)
      const trend = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - i);
        monthStart.setDate(1);

        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        const monthBugs = resolvedBugs.filter((b) => {
          const resolved = new Date(b.resolvedAt!);
          return resolved >= monthStart && resolved < monthEnd;
        });

        const monthAvg =
          monthBugs.length > 0
            ? monthBugs.reduce((sum, bug) => {
                const hours =
                  (new Date(bug.resolvedAt!).getTime() - new Date(bug.createdAt).getTime()) /
                  (1000 * 60 * 60);
                return sum + hours;
              }, 0) / monthBugs.length
            : 0;

        trend.push({
          month: monthStart.toISOString().slice(0, 7),
          avgTime: Math.round(monthAvg),
        });
      }

      res.json({
        success: true,
        data: {
          averageResolutionTime: Math.round(averageResolutionTime * 10) / 10,
          medianResolutionTime: Math.round(medianResolutionTime * 10) / 10,
          bySeverity,
          trend,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getFeatureCompletion = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const workspaceId = req.user!.workspaceId!;
      const { startDate, endDate } = req.query;

      const features = await this.featureRepository.findByWorkspace(workspaceId, {
        createdAfter: startDate ? new Date(startDate as string) : undefined,
        createdBefore: endDate ? new Date(endDate as string) : undefined,
      });

      const completed = features.filter((f) => f.isCompleted()).length;
      const completionRate =
        features.length > 0 ? Math.round((completed / features.length) * 100) : 0;

      // Group by priority
      const byPriority = {
        critical: { total: 0, completed: 0 },
        high: { total: 0, completed: 0 },
        medium: { total: 0, completed: 0 },
        low: { total: 0, completed: 0 },
      };

      features.forEach((f) => {
        const priority = f.priority as keyof typeof byPriority;
        if (byPriority[priority]) {
          byPriority[priority].total += 1;
          if (f.isCompleted()) {
            byPriority[priority].completed += 1;
          }
        }
      });

      // Calculate monthly trend
      const trend = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - i);
        monthStart.setDate(1);

        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        const monthFeatures = features.filter((f) => {
          const created = new Date(f.createdAt);
          return created >= monthStart && created < monthEnd;
        });

        const monthCompleted = monthFeatures.filter((f) => f.isCompleted()).length;
        const monthRate =
          monthFeatures.length > 0 ? Math.round((monthCompleted / monthFeatures.length) * 100) : 0;

        trend.push({
          month: monthStart.toISOString().slice(0, 7),
          rate: monthRate,
        });
      }

      res.json({
        success: true,
        data: {
          completionRate,
          total: features.length,
          completed,
          byPriority,
          trend,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getReleaseFrequency = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const workspaceId = req.user!.workspaceId!;
      const { startDate, endDate } = req.query;

      const releases = await this.releaseRepository.findByWorkspace(workspaceId);

      // Filter by date range
      const filteredReleases = releases.filter((r) => {
        if (!r.releaseDate) return false;
        const releaseDate = new Date(r.releaseDate);

        if (startDate && releaseDate < new Date(startDate as string)) return false;
        if (endDate && releaseDate > new Date(endDate as string)) return false;

        return true;
      });

      // Group by month
      const monthlyReleases = new Map<string, number>();
      filteredReleases.forEach((release: any) => {
        const month = new Date(release.releaseDate!).toISOString().slice(0, 7);
        monthlyReleases.set(month, (monthlyReleases.get(month) || 0) + 1);
      });

      // Convert to array and sort
      const data = Array.from(monthlyReleases.entries())
        .map(([month, releases]) => ({ month, releases }))
        .sort((a, b) => a.month.localeCompare(b.month));

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getTeamWorkload = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({
        success: true,
        data: [],
      });
    } catch (error) {
      next(error);
    }
  };

  getTimeTracking = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.user!.workspaceId!;
      const { startDate, endDate, userId } = req.query;

      // Get all tasks in workspace
      const tasks = await this.taskRepository.findByWorkspace(workspaceId, { userId });

      // Get time logs
      const allTimeLogs: TimeLog[] = [];
      for (const task of tasks) {
        const logs = await this.timeLogRepository.findByTask(task.id);

        // Filter by date
        const filteredLogs = logs.filter((log) => {
          const logDate = new Date(log.date);
          if (startDate && logDate < new Date(startDate as string)) return false;
          if (endDate && logDate > new Date(endDate as string)) return false;
          return true;
        });

        allTimeLogs.push(...filteredLogs);
      }

      const totalHours = allTimeLogs.reduce((sum, log) => sum + log.hours, 0);

      // For simplicity, assume 90% is billable
      const billableHours = totalHours * 0.9;

      // Group by type (would need task type field)
      const byType = {
        development: totalHours * 0.6,
        testing: totalHours * 0.2,
        meetings: totalHours * 0.1,
        documentation: totalHours * 0.1,
      };

      // Group by user
      const userHours = new Map<string, { name: string; hours: number }>();
      allTimeLogs.forEach((log) => {
        const existing = userHours.get(log.userId) || { name: 'User', hours: 0 };
        existing.hours += log.hours;
        userHours.set(log.userId, existing);
      });

      const byUser = Array.from(userHours.entries()).map(([userId, data]) => ({
        userId,
        name: data.name,
        hours: Math.round(data.hours * 10) / 10,
        efficiency: 0.85, // Mock - would need to calculate
      }));

      res.json({
        success: true,
        data: {
          totalHours: Math.round(totalHours * 10) / 10,
          billableHours: Math.round(billableHours * 10) / 10,
          byType,
          byUser,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getProductsHealth = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const workspaceId = req.user!.workspaceId!;

      const products = await this.productRepository.findByWorkspace(workspaceId);

      const healthData = await Promise.all(
        products.map(async (product) => {
          const bugs = await this.bugRepository.findByProduct(product.id);
          const features = await this.featureRepository.findByProduct(product.id);
          const sprints = await this.sprintRepository.findByProduct(product.id);

          const openBugs = bugs.filter((b) => !b.isResolved()).length;
          const openIssues = features.filter((f) => !f.isCompleted()).length;

          // Calculate velocity
          const completedSprints = sprints.filter((s) => s.isCompleted());
          const avgVelocity =
            completedSprints.length > 0
              ? completedSprints.reduce((sum, s) => sum + s.velocity, 0) / completedSprints.length
              : 0;

          // Calculate health score (0-100)
          let healthScore = 100;
          healthScore -= Math.min(openBugs * 2, 30); // Bugs impact
          healthScore -= Math.min((openIssues / 10) * 10, 20); // Open issues impact
          healthScore = Math.max(0, healthScore);

          return {
            productId: product.id,
            name: product.name,
            healthScore: Math.round(healthScore),
            metrics: {
              bugCount: openBugs,
              openIssues,
              testCoverage: 78, // Mock - would need actual data
              velocity: Math.round(avgVelocity),
            },
          };
        })
      );

      res.json({
        success: true,
        data: healthData,
      });
    } catch (error) {
      next(error);
    }
  };

  getTeamPerformance = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const workspaceId = req.user!.workspaceId!;
      const { userId, startDate, endDate } = req.query;

      // Get all tasks
      const tasks = await this.taskRepository.findByWorkspace(workspaceId, {
        assigneeId: userId as string,
        completedAfter: startDate ? new Date(startDate as string) : undefined,
        completedBefore: endDate ? new Date(endDate as string) : undefined,
      });

      // Get bugs
      const bugs = await this.bugRepository.findByWorkspace(workspaceId, {
        assigneeId: userId as string,
      });

      // Group by user
      const userPerformance = new Map<string, any>();

      tasks.forEach((task) => {
        if (!task.assigneeId) return;

        const existing = userPerformance.get(task.assigneeId) || {
          userId: task.assigneeId,
          name: 'User',
          tasksCompleted: 0,
          totalPoints: 0,
          completionTimes: [],
          bugsFixed: 0,
          codeReviews: 0,
        };

        if (task.isCompleted()) {
          existing.tasksCompleted += 1;
          existing.totalPoints += task.estimatedHours || 0;

          if (task.completedAt) {
            const completionTime =
              (new Date(task.completedAt).getTime() - new Date(task.createdAt).getTime()) /
              (1000 * 60 * 60 * 24); // days
            existing.completionTimes.push(completionTime);
          }
        }
        userPerformance.set(task.assigneeId, existing);
      });

      // Add bug fixes
      bugs.forEach((bug) => {
        if (!bug.assigneeId || !bug.isResolved()) return;

        const existing = userPerformance.get(bug.assigneeId);
        if (existing) {
          existing.bugsFixed += 1;
        }
      });

      const performanceData = Array.from(userPerformance.values()).map((user) => ({
        userId: user.userId,
        name: user.name,
        tasksCompleted: user.tasksCompleted,
        velocity: Math.round(user.totalPoints),
        avgCompletionTime:
          user.completionTimes.length > 0
            ? Math.round(
                (user.completionTimes.reduce((a: number, b: number) => a + b, 0) /
                  user.completionTimes.length) *
                  10
              ) / 10
            : 0,
        bugFixRate: user.bugsFixed > 0 ? 0.92 : 0, // Mock
        codeReviewCount: user.codeReviews,
      }));

      res.json({
        success: true,
        data: performanceData,
      });
    } catch (error) {
      next(error);
    }
  };

  exportAnalytics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type, format, startDate, endDate } = req.body;

      // Validate input
      if (!type || !format) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'type and format required' },
        });
        return;
      }

      // In a real implementation, you would:
      // 1. Fetch the requested data
      // 2. Convert to CSV/Excel/JSON
      // 3. Upload to S3 or file storage
      // 4. Generate a signed URL
      // 5. Return the URL

      // Mock implementation
      const mockUrl = `https://storage.example.com/export-${Date.now()}.${format}`;
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      res.json({
        success: true,
        data: {
          downloadUrl: mockUrl,
          expiresAt: expiresAt.toISOString(),
        },
        message: 'Export generated successfully (mock)',
      });
    } catch (error) {
      next(error);
    }
  };
}
