import { Response, NextFunction } from 'express';
import { Task, TaskStatus } from '@core/domain/entities/Task';
import { TaskRepository } from '@infrastructure/database/repositories/TaskRepository';
import { TimeLogRepository } from '@infrastructure/database/repositories/TimeLogRepository';
import { CommentRepository } from '@infrastructure/database/repositories/CommentRepository';
import { TimeLog } from '@core/domain/entities/TimeLog';
import { Comment, CommentableType } from '@core/domain/entities/Comment';
import { AuthRequest } from '../middleware/auth.middleware';

// Interface for subtasks (stored in task metadata)
interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

// Interface for dependencies (stored in task metadata)
interface TaskDependency {
  taskId: string;
  dependsOnTaskId: string;
  type: 'blocks' | 'blocked_by';
  createdAt: Date;
}

// Interface for attachments (stored in task metadata)
interface TaskAttachment {
  id: string;
  url: string;
  filename: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
}

export class TasksController {
  private taskRepository: TaskRepository;
  private timeLogRepository: TimeLogRepository;
  private commentRepository: CommentRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
    this.timeLogRepository = new TimeLogRepository();
    this.commentRepository = new CommentRepository();
  }

  /**
   * GET /tasks
   * Get all tasks with pagination and filters
   */
  list = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.user!.workspaceId;
      if (!workspaceId) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'User must belong to a workspace' },
        });
        return;
      }

      const {
        page = '1',
        limit = '50',
        status,
        type,
        priority,
        assigneeId,
        sprintId,
        featureId,
        search,
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      const tasks = await this.taskRepository.findByWorkspace(workspaceId, {
        status,
        type,
        priority,
        assigneeId,
        sprintId,
        featureId,
        search,
        limit: limitNum,
        offset,
      });

      // Get total count
      const allTasks = await this.taskRepository.findByWorkspace(workspaceId, {
        status,
        type,
        priority,
        assigneeId,
        sprintId,
        featureId,
        search,
      });
      const total = allTasks.length;

      res.json({
        success: true,
        data: tasks.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status,
          type: t.metadata?.type || 'feature',
          priority: t.priority,
          assigneeId: t.assigneeId,
          featureId: t.featureId,
          sprintId: t.sprintId,
          storyPoints: t.metadata?.storyPoints || 0,
          estimatedHours: t.estimatedHours,
          loggedHours: t.actualHours || 0,
          dueDate: t.metadata?.dueDate,
          subtasks: t.metadata?.subtasks || [],
          comments: [],
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasNext: pageNum * limitNum < total,
          hasPrev: pageNum > 1,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /tasks/:id
   * Get task by ID
   */
  get = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const task: any = await this.taskRepository.findById(id);
      if (!task) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found' },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: task.id,
          workspaceId: task.workspaceId,
          title: task.title,
          description: task.description,
          status: task.status,
          type: task.metadata?.type || 'feature',
          priority: task.priority,
          assigneeId: task.assigneeId,
          featureId: task.featureId,
          sprintId: task.sprintId,
          storyPoints: task.metadata?.storyPoints || 0,
          estimatedHours: task.estimatedHours,
          loggedHours: task.actualHours || 0,
          dueDate: task.metadata?.dueDate,
          isBlocked: task.isBlocked,
          blockedReason: task.blockedReason,
          subtasks: task.metadata?.subtasks || [],
          dependencies: task.metadata?.dependencies || [],
          attachments: task.metadata?.attachments || [],
          tags: task.tags,
          completedAt: task.completedAt,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /tasks
   * Create task
   */
  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = req.user!.workspaceId;
      if (!workspaceId) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'User must belong to a workspace' },
        });
        return;
      }

      const {
        title,
        description,
        status,
        type,
        priority,
        featureId,
        sprintId,
        assigneeId,
        storyPoints,
        estimatedHours,
        dueDate,
      } = req.body;

      const task: any = Task.create(workspaceId, title, description, featureId, sprintId);

      // Update with additional fields
      const metadata = task.metadata || {};
      metadata.type = type || 'feature';
      metadata.storyPoints = storyPoints || 0;
      metadata.dueDate = dueDate;
      metadata.subtasks = [];
      metadata.dependencies = [];
      metadata.attachments = [];

      task.update({
        priority: priority || 'medium',
        estimatedHours: estimatedHours || 0,
      });

      if (status) {
        task.changeStatus(status);
      }

      if (assigneeId) {
        task.assign(assigneeId);
      }

      await this.taskRepository.save(task);

      res.status(201).json({
        success: true,
        data: {
          id: task.id,
          title: task.title,
          status: task.status,
          type: metadata.type,
          priority: task.priority,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /tasks/:id
   * Update task
   */
  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, description, priority, estimatedHours, tags, type, storyPoints, dueDate } =
        req.body;

      const task: any = await this.taskRepository.findById(id);
      if (!task) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found' },
        });
        return;
      }

      task.update({
        title,
        description,
        priority,
        estimatedHours,
        tags,
      });

      // Update metadata
      const metadata = task.metadata || {};
      if (type) metadata.type = type;
      if (storyPoints !== undefined) metadata.storyPoints = storyPoints;
      if (dueDate !== undefined) metadata.dueDate = dueDate;

      await this.taskRepository.update(task);

      res.json({
        success: true,
        data: {
          id: task.id,
          title: task.title,
          status: task.status,
          updatedAt: task.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /tasks/:id
   * Delete task
   */
  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const task = await this.taskRepository.findById(id);
      if (!task) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found' },
        });
        return;
      }

      await this.taskRepository.delete(id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /tasks/:id/status
   * Update task status
   */
  updateStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const task = await this.taskRepository.findById(id);
      if (!task) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found' },
        });
        return;
      }

      task.changeStatus(status as TaskStatus);
      await this.taskRepository.update(task);

      res.json({
        success: true,
        data: {
          id: task.id,
          status: task.status,
          completedAt: task.completedAt,
          updatedAt: task.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /tasks/:id/assign
   * Assign task to user
   */
  assign = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { assigneeId } = req.body;

      const task = await this.taskRepository.findById(id);
      if (!task) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found' },
        });
        return;
      }

      task.assign(assigneeId);
      await this.taskRepository.update(task);

      res.json({
        success: true,
        data: {
          id: task.id,
          assigneeId: task.assigneeId,
          updatedAt: task.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /tasks/:id/assign
   * Unassign task
   */
  unassign = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const task = await this.taskRepository.findById(id);
      if (!task) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found' },
        });
        return;
      }

      task.unassign();
      await this.taskRepository.update(task);

      res.json({
        success: true,
        data: {
          id: task.id,
          assigneeId: null,
          updatedAt: task.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /tasks/:id/time-log
   * Log time on task
   */
  logTime = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { hours, description } = req.body;
      const userId = req.user!.sub;

      const task = await this.taskRepository.findById(id);
      if (!task) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found' },
        });
        return;
      }

      // Create time log
      const timeLog = TimeLog.create(id, userId, parseFloat(hours), new Date(), description);
      await this.timeLogRepository.save(timeLog);

      // Update task actual hours
      task.logTime(parseFloat(hours));
      await this.taskRepository.update(task);

      res.json({
        success: true,
        data: {
          id: timeLog.id,
          taskId: timeLog.taskId,
          userId: timeLog.userId,
          hours: timeLog.hours,
          description: timeLog.description,
          loggedAt: timeLog.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /tasks/:id/time-logs
   * Get task time logs
   */
  getTimeLogs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const task = await this.taskRepository.findById(id);
      if (!task) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found' },
        });
        return;
      }

      const timeLogs = await this.timeLogRepository.findByTask(id);

      res.json({
        success: true,
        data: timeLogs.map((log) => ({
          id: log.id,
          userId: log.userId,
          hours: log.hours,
          description: log.description,
          loggedAt: log.createdAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /tasks/:id/subtasks
   * Add subtask
   */
  addSubtask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { title } = req.body;

      const task: any = await this.taskRepository.findById(id);
      if (!task) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found' },
        });
        return;
      }

      const metadata = task.metadata || {};
      const subtasks: Subtask[] = metadata.subtasks || [];

      const newSubtask: Subtask = {
        id: crypto.randomUUID(),
        title,
        completed: false,
        createdAt: new Date(),
      };

      subtasks.push(newSubtask);
      metadata.subtasks = subtasks;

      await this.taskRepository.update(task);

      res.status(201).json({
        success: true,
        data: newSubtask,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /tasks/:id/subtasks/:subtaskId
   * Update subtask
   */
  updateSubtask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, subtaskId } = req.params;
      const { title, completed } = req.body;

      const task: any = await this.taskRepository.findById(id);
      if (!task) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found' },
        });
        return;
      }

      const metadata = task.metadata || {};
      const subtasks: Subtask[] = metadata.subtasks || [];
      const subtaskIndex = subtasks.findIndex((s) => s.id === subtaskId);

      if (subtaskIndex === -1) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Subtask not found' },
        });
        return;
      }

      if (title !== undefined) subtasks[subtaskIndex].title = title;
      if (completed !== undefined) subtasks[subtaskIndex].completed = completed;

      metadata.subtasks = subtasks;
      await this.taskRepository.update(task);

      res.json({
        success: true,
        data: subtasks[subtaskIndex],
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /tasks/:id/subtasks/:subtaskId
   * Delete subtask
   */
  deleteSubtask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, subtaskId } = req.params;

      const task: any = await this.taskRepository.findById(id);
      if (!task) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found' },
        });
        return;
      }

      const metadata = task.metadata || {};
      const subtasks: Subtask[] = metadata.subtasks || [];
      metadata.subtasks = subtasks.filter((s) => s.id !== subtaskId);

      await this.taskRepository.update(task);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /tasks/:id/subtasks/:subtaskId/toggle
   * Toggle subtask completion
   */
  toggleSubtask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, subtaskId } = req.params;

      const task: any = await this.taskRepository.findById(id);
      if (!task) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found' },
        });
        return;
      }

      const metadata = task.metadata || {};
      const subtasks: Subtask[] = metadata.subtasks || [];
      const subtask = subtasks.find((s) => s.id === subtaskId);

      if (!subtask) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Subtask not found' },
        });
        return;
      }

      subtask.completed = !subtask.completed;
      metadata.subtasks = subtasks;
      await this.taskRepository.update(task);

      res.json({
        success: true,
        data: subtask,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /tasks/:id/comments
   * Get task comments
   */
  getComments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const task = await this.taskRepository.findById(id);
      if (!task) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found' },
        });
        return;
      }

      const comments = await this.commentRepository.findByEntity(CommentableType.TASK, id);

      res.json({
        success: true,
        data: comments.map((c) => ({
          id: c.id,
          content: c.content,
          userId: c.authorId,
          userName: 'User Name', // Would need user lookup
          userAvatar: null,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /tasks/:id/comments
   * Add comment to task
   */
  addComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const workspaceId = req.user!.workspaceId!;
      const authorId = req.user!.sub;

      const task = await this.taskRepository.findById(id);
      if (!task) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found' },
        });
        return;
      }

      const comment = Comment.create(workspaceId, authorId, CommentableType.TASK, id, content);
      await this.commentRepository.save(comment);

      res.status(201).json({
        success: true,
        data: {
          id: comment.id,
          content: comment.content,
          userId: comment.authorId,
          createdAt: comment.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /tasks/:id/comments/:commentId
   * Update comment
   */
  updateComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { commentId } = req.params;
      const { content } = req.body;

      const comment = await this.commentRepository.findById(commentId);
      if (!comment) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Comment not found' },
        });
        return;
      }

      comment.updateContent(content);
      await this.commentRepository.update(comment);

      res.json({
        success: true,
        data: {
          id: comment.id,
          content: comment.content,
          updatedAt: comment.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /tasks/:id/comments/:commentId
   * Delete comment
   */
  deleteComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { commentId } = req.params;

      await this.commentRepository.delete(commentId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /tasks/:id/dependencies
   * Add task dependency
   */
  addDependency = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { dependsOnTaskId, type } = req.body;

      const task: any = await this.taskRepository.findById(id);
      if (!task) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found' },
        });
        return;
      }

      // Verify dependent task exists
      const dependentTask = await this.taskRepository.findById(dependsOnTaskId);
      if (!dependentTask) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Dependent task not found' },
        });
        return;
      }

      const metadata = task.metadata || {};
      const dependencies: TaskDependency[] = metadata.dependencies || [];

      const newDependency: TaskDependency = {
        taskId: id,
        dependsOnTaskId,
        type: type || 'blocks',
        createdAt: new Date(),
      };

      dependencies.push(newDependency);
      metadata.dependencies = dependencies;

      await this.taskRepository.update(task);

      res.status(201).json({
        success: true,
        message: 'Dependency added',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /tasks/:id/dependencies/:dependsOnTaskId
   * Remove task dependency
   */
  removeDependency = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, dependsOnTaskId } = req.params;

      const task: any = await this.taskRepository.findById(id);
      if (!task) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found' },
        });
        return;
      }

      const metadata = task.metadata || {};
      const dependencies: TaskDependency[] = metadata.dependencies || [];
      metadata.dependencies = dependencies.filter((d) => d.dependsOnTaskId !== dependsOnTaskId);

      await this.taskRepository.update(task);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /tasks/:id/attachments
   * Upload attachment
   */
  uploadAttachment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.sub;

      const task: any = await this.taskRepository.findById(id);
      if (!task) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found' },
        });
        return;
      }

      // In production, handle file upload with multer and upload to S3
      // Mock implementation
      const mockAttachment: TaskAttachment = {
        id: crypto.randomUUID(),
        url: `https://storage.example.com/tasks/${id}/${Date.now()}-file.pdf`,
        filename: 'document.pdf',
        size: 1024000,
        uploadedBy: userId,
        uploadedAt: new Date(),
      };

      const metadata = task.metadata || {};
      const attachments: TaskAttachment[] = metadata.attachments || [];
      attachments.push(mockAttachment);
      metadata.attachments = attachments;

      await this.taskRepository.update(task);

      res.status(201).json({
        success: true,
        data: {
          url: mockAttachment.url,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /tasks/:id/attachments/:attachmentId
   * Delete attachment
   */
  deleteAttachment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, attachmentId } = req.params;

      const task: any = await this.taskRepository.findById(id);
      if (!task) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found' },
        });
        return;
      }

      const metadata = task.metadata || {};
      const attachments: TaskAttachment[] = metadata.attachments || [];
      metadata.attachments = attachments.filter((a) => a.id !== attachmentId);

      await this.taskRepository.update(task);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
