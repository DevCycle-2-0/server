// src/modules/sprints/application/use-cases/SprintUseCases.ts
import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/application/Result";
import { ISprintRepository } from "@modules/sprints/domain/repositories/ISprintRepository";
import { IProductRepository } from "@modules/products/domain/repositories/IProductRepository";
import { ITaskRepository } from "@modules/tasks/domain/repositories/ITaskRepository";
import { IBugRepository } from "@modules/bugs/domain/repositories/IBugRepository";
import { Sprint } from "@modules/sprints/domain/entities/Sprint";
import {
  SprintDto,
  CreateSprintRequest,
  UpdateSprintRequest,
  SaveRetrospectiveRequest,
  SprintRetrospectiveDto,
  SprintMetricsDto,
  GetSprintsQuery,
} from "../dtos/SprintDtos";

// Helper function to map Sprint to SprintDto
function mapSprintToDto(sprint: Sprint): SprintDto {
  // Helper function to safely convert to date string
  const toDateString = (date: Date | string): string => {
    if (date instanceof Date) {
      return date.toISOString().split("T")[0];
    }
    // If it's already a string, ensure it's in the correct format
    return new Date(date).toISOString().split("T")[0];
  };

  return {
    id: sprint.id,
    name: sprint.name,
    goal: sprint.goal,
    productId: sprint.productId,
    productName: sprint.productName,
    status: sprint.status,
    startDate: toDateString(sprint.startDate),
    endDate: toDateString(sprint.endDate),
    taskIds: sprint.taskIds,
    bugIds: sprint.bugIds,
    capacity: sprint.capacity,
    velocity: sprint.velocity,
    retrospective: sprint.retrospective
      ? {
          wentWell: sprint.retrospective.wentWell,
          needsImprovement: sprint.retrospective.needsImprovement,
          actionItems: sprint.retrospective.actionItems,
          savedAt: sprint.retrospective.savedAt?.toISOString(),
          savedBy: sprint.retrospective.savedBy,
          savedByName: sprint.retrospective.savedByName,
        }
      : undefined,
    createdAt: sprint.createdAt.toISOString(),
    updatedAt: sprint.updatedAt.toISOString(),
  };
}

// Create Sprint Use Case
interface CreateSprintInput {
  data: CreateSprintRequest;
  workspaceId: string;
}

export class CreateSprintUseCase
  implements UseCase<CreateSprintInput, Result<SprintDto>>
{
  constructor(
    private sprintRepository: ISprintRepository,
    private productRepository: IProductRepository
  ) {}

  // Add this debug logging to CreateSprintUseCase.execute()

  async execute(input: CreateSprintInput): Promise<Result<SprintDto>> {
    const product = await this.productRepository.findById(input.data.productId);
    if (!product) {
      return Result.fail<SprintDto>("Product not found");
    }

    if (product.workspaceId !== input.workspaceId) {
      return Result.fail<SprintDto>("Product not found");
    }

    const sprint = Sprint.create({
      name: input.data.name,
      goal: input.data.goal,
      productId: input.data.productId,
      productName: product.name,
      startDate: new Date(input.data.startDate),
      endDate: new Date(input.data.endDate),
      capacity: input.data.capacity,
      workspaceId: input.workspaceId,
    });

    const savedSprint = await this.sprintRepository.save(sprint);
    return Result.ok<SprintDto>(mapSprintToDto(savedSprint));
  }
}

// Get Sprints Use Case
interface GetSprintsInput {
  query: GetSprintsQuery;
  workspaceId: string;
}

interface GetSprintsResult {
  sprints: SprintDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class GetSprintsUseCase
  implements UseCase<GetSprintsInput, Result<GetSprintsResult>>
{
  constructor(private sprintRepository: ISprintRepository) {}

  async execute(input: GetSprintsInput): Promise<Result<GetSprintsResult>> {
    const page = input.query.page || 1;
    const limit = Math.min(input.query.limit || 20, 100);

    const { sprints, total } = await this.sprintRepository.findAll(
      {
        status: input.query.status,
        productId: input.query.productId,
        workspaceId: input.workspaceId,
      },
      { sortBy: undefined, sortOrder: undefined },
      page,
      limit
    );

    const totalPages = Math.ceil(total / limit);

    return Result.ok<GetSprintsResult>({
      sprints: sprints.map(mapSprintToDto),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  }
}

// Get Sprint By ID Use Case
export class GetSprintByIdUseCase
  implements UseCase<string, Result<SprintDto>>
{
  constructor(private sprintRepository: ISprintRepository) {}

  async execute(sprintId: string): Promise<Result<SprintDto>> {
    const sprint = await this.sprintRepository.findById(sprintId);
    if (!sprint) {
      return Result.fail<SprintDto>("Sprint not found");
    }
    return Result.ok<SprintDto>(mapSprintToDto(sprint));
  }
}

// Update Sprint Use Case
interface UpdateSprintInput {
  sprintId: string;
  data: UpdateSprintRequest;
  workspaceId: string;
}

export class UpdateSprintUseCase
  implements UseCase<UpdateSprintInput, Result<SprintDto>>
{
  constructor(private sprintRepository: ISprintRepository) {}

  async execute(input: UpdateSprintInput): Promise<Result<SprintDto>> {
    const sprint = await this.sprintRepository.findById(input.sprintId);
    if (!sprint) {
      return Result.fail<SprintDto>("Sprint not found");
    }

    if (sprint.workspaceId !== input.workspaceId) {
      return Result.fail<SprintDto>("Sprint not found");
    }

    try {
      sprint.update(
        input.data.name,
        input.data.goal,
        input.data.startDate ? new Date(input.data.startDate) : undefined,
        input.data.endDate ? new Date(input.data.endDate) : undefined,
        input.data.capacity
      );

      const updatedSprint = await this.sprintRepository.save(sprint);
      return Result.ok<SprintDto>(mapSprintToDto(updatedSprint));
    } catch (error: any) {
      return Result.fail<SprintDto>(error.message);
    }
  }
}

// Start Sprint Use Case
interface SprintActionInput {
  sprintId: string;
  workspaceId: string;
}

export class StartSprintUseCase
  implements UseCase<SprintActionInput, Result<SprintDto>>
{
  constructor(private sprintRepository: ISprintRepository) {}

  async execute(input: SprintActionInput): Promise<Result<SprintDto>> {
    const sprint = await this.sprintRepository.findById(input.sprintId);
    if (!sprint) {
      return Result.fail<SprintDto>("Sprint not found");
    }

    if (sprint.workspaceId !== input.workspaceId) {
      return Result.fail<SprintDto>("Sprint not found");
    }

    try {
      sprint.start();
      const updatedSprint = await this.sprintRepository.save(sprint);
      return Result.ok<SprintDto>(mapSprintToDto(updatedSprint));
    } catch (error: any) {
      return Result.fail<SprintDto>(error.message);
    }
  }
}

// Complete Sprint Use Case
export class CompleteSprintUseCase
  implements UseCase<SprintActionInput, Result<SprintDto>>
{
  constructor(private sprintRepository: ISprintRepository) {}

  async execute(input: SprintActionInput): Promise<Result<SprintDto>> {
    const sprint = await this.sprintRepository.findById(input.sprintId);
    if (!sprint) {
      return Result.fail<SprintDto>("Sprint not found");
    }

    if (sprint.workspaceId !== input.workspaceId) {
      return Result.fail<SprintDto>("Sprint not found");
    }

    try {
      // TODO: Calculate velocity from completed tasks
      sprint.complete();
      const updatedSprint = await this.sprintRepository.save(sprint);
      return Result.ok<SprintDto>(mapSprintToDto(updatedSprint));
    } catch (error: any) {
      return Result.fail<SprintDto>(error.message);
    }
  }
}

// Add Task to Sprint Use Case
interface AddTaskInput {
  sprintId: string;
  taskId: string;
  workspaceId: string;
}

export class AddTaskToSprintUseCase
  implements UseCase<AddTaskInput, Result<SprintDto>>
{
  constructor(
    private sprintRepository: ISprintRepository,
    private taskRepository: ITaskRepository
  ) {}

  async execute(input: AddTaskInput): Promise<Result<SprintDto>> {
    const sprint = await this.sprintRepository.findById(input.sprintId);
    if (!sprint) {
      return Result.fail<SprintDto>("Sprint not found");
    }

    if (sprint.workspaceId !== input.workspaceId) {
      return Result.fail<SprintDto>("Sprint not found");
    }

    const task = await this.taskRepository.findById(input.taskId);
    if (!task) {
      return Result.fail<SprintDto>("Task not found");
    }

    if (task.workspaceId !== input.workspaceId) {
      return Result.fail<SprintDto>("Task not found");
    }

    sprint.addTask(input.taskId);
    task.addToSprint(input.sprintId, sprint.name);

    await this.taskRepository.save(task);
    const updatedSprint = await this.sprintRepository.save(sprint);
    return Result.ok<SprintDto>(mapSprintToDto(updatedSprint));
  }
}

// Remove Task from Sprint Use Case
interface RemoveTaskInput {
  sprintId: string;
  taskId: string;
  workspaceId: string;
}

export class RemoveTaskFromSprintUseCase
  implements UseCase<RemoveTaskInput, Result<SprintDto>>
{
  constructor(
    private sprintRepository: ISprintRepository,
    private taskRepository: ITaskRepository
  ) {}

  async execute(input: RemoveTaskInput): Promise<Result<SprintDto>> {
    const sprint = await this.sprintRepository.findById(input.sprintId);
    if (!sprint) {
      return Result.fail<SprintDto>("Sprint not found");
    }

    if (sprint.workspaceId !== input.workspaceId) {
      return Result.fail<SprintDto>("Sprint not found");
    }

    const removed = sprint.removeTask(input.taskId);
    if (!removed) {
      return Result.fail<SprintDto>("Task not found in sprint");
    }

    const task = await this.taskRepository.findById(input.taskId);
    if (task) {
      task.removeFromSprint();
      await this.taskRepository.save(task);
    }

    const updatedSprint = await this.sprintRepository.save(sprint);
    return Result.ok<SprintDto>(mapSprintToDto(updatedSprint));
  }
}

// Save Retrospective Use Case
interface SaveRetrospectiveInput {
  sprintId: string;
  data: SaveRetrospectiveRequest;
  userId: string;
  userName: string;
  workspaceId: string;
}

export class SaveRetrospectiveUseCase
  implements UseCase<SaveRetrospectiveInput, Result<SprintRetrospectiveDto>>
{
  constructor(private sprintRepository: ISprintRepository) {}

  async execute(
    input: SaveRetrospectiveInput
  ): Promise<Result<SprintRetrospectiveDto>> {
    const sprint = await this.sprintRepository.findById(input.sprintId);
    if (!sprint) {
      return Result.fail<SprintRetrospectiveDto>("Sprint not found");
    }

    if (sprint.workspaceId !== input.workspaceId) {
      return Result.fail<SprintRetrospectiveDto>("Sprint not found");
    }

    try {
      sprint.saveRetrospective(
        input.data.wentWell,
        input.data.needsImprovement,
        input.data.actionItems,
        input.userId,
        input.userName
      );

      const updatedSprint = await this.sprintRepository.save(sprint);
      const retro = updatedSprint.retrospective!;

      return Result.ok<SprintRetrospectiveDto>({
        wentWell: retro.wentWell,
        needsImprovement: retro.needsImprovement,
        actionItems: retro.actionItems,
        savedAt: retro.savedAt?.toISOString(),
        savedBy: retro.savedBy,
        savedByName: retro.savedByName,
      });
    } catch (error: any) {
      return Result.fail<SprintRetrospectiveDto>(error.message);
    }
  }
}

// Get Sprint Metrics Use Case
interface GetMetricsInput {
  sprintId: string;
  workspaceId: string;
}

export class GetSprintMetricsUseCase
  implements UseCase<GetMetricsInput, Result<SprintMetricsDto>>
{
  constructor(private sprintRepository: ISprintRepository) {}

  async execute(input: GetMetricsInput): Promise<Result<SprintMetricsDto>> {
    const sprint = await this.sprintRepository.findById(input.sprintId);
    if (!sprint) {
      return Result.fail<SprintMetricsDto>("Sprint not found");
    }

    if (sprint.workspaceId !== input.workspaceId) {
      return Result.fail<SprintMetricsDto>("Sprint not found");
    }

    const metrics = await this.sprintRepository.getMetrics(input.sprintId);
    return Result.ok<SprintMetricsDto>(metrics);
  }
}
