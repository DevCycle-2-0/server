export class DashboardController {
  private featureRepository: FeatureRepository;
  private sprintRepository: SprintRepository;
  private taskRepository: TaskRepository;
  private bugRepository: BugRepository;

  constructor() {
    this.featureRepository = new FeatureRepository();
    this.sprintRepository = new SprintRepository();
    this.taskRepository = new TaskRepository();
    this.bugRepository = new BugRepository();
  }

  getStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.user!.workspaceId!;

      const sprints = await this.sprintRepository.findActive(workspaceId);
      const tasks = await this.taskRepository.findByWorkspace(workspaceId);
      const bugs = await this.bugRepository.findByWorkspace(workspaceId);

      const pendingTasks = tasks.filter((t) => !t.isCompleted()).length;
      const openBugs = bugs.filter((b) => !b.isResolved()).length;

      res.json({
        success: true,
        data: {
          activeSprints: sprints.length,
          pendingTasks,
          openBugs,
          upcomingReleases: 0,
          teamAvailability: {
            available: 8,
            busy: 4,
            away: 1,
            offline: 2,
          },
          recentActivity: {
            tasksCompletedToday: 5,
            bugsFixedToday: 2,
            featuresApprovedToday: 1,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getActivity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({
        success: true,
        data: [],
        pagination: { page: 1, limit: 10, total: 0 },
      });
    } catch (error) {
      next(error);
    }
  };

  getSprintSummary = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.user!.workspaceId!;
      const sprints = await this.sprintRepository.findActive(workspaceId);

      res.json({
        success: true,
        data: {
          activeSprints: await Promise.all(
            sprints.map(async (s) => {
              const tasks = await this.taskRepository.findBySprint(s.id);
              const completed = tasks.filter((t) => t.isCompleted()).length;

              return {
                id: s.id,
                name: s.name,
                progress: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
                tasksTotal: tasks.length,
                tasksCompleted: completed,
                daysRemaining: s.getDaysRemaining(),
                velocity: s.velocity,
                teamMembers: 5, // Mock
              };
            })
          ),
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
