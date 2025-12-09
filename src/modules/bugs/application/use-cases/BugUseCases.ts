import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/application/Result";
import { IBugRepository } from "@modules/bugs/domain/repositories/IBugRepository";
import { IProductRepository } from "@modules/products/domain/repositories/IProductRepository";
import { Bug } from "@modules/bugs/domain/entities/Bug";
import {
  BugDto,
  CreateBugRequest,
  UpdateBugRequest,
  UpdateBugStatusRequest,
  AddRetestResultRequest,
  BugRetestResultDto,
  BugStatisticsDto,
  GetBugsQuery,
} from "../dtos/BugDtos";

// Helper function to map Bug to BugDto
function mapBugToDto(bug: Bug): BugDto {
  return {
    id: bug.id,
    title: bug.title,
    description: bug.description,
    stepsToReproduce: bug.stepsToReproduce,
    expectedBehavior: bug.expectedBehavior,
    actualBehavior: bug.actualBehavior,
    status: bug.status,
    severity: bug.severity,
    priority: bug.priority,
    productId: bug.productId,
    productName: bug.productName,
    platform: bug.platform,
    featureId: bug.featureId,
    featureTitle: bug.featureTitle,
    sprintId: bug.sprintId,
    sprintName: bug.sprintName,
    reporterId: bug.reporterId,
    reporterName: bug.reporterName,
    assigneeId: bug.assigneeId,
    assigneeName: bug.assigneeName,
    environment: bug.environment,
    version: bug.version,
    browserInfo: bug.browserInfo,
    retestResults: bug.retestResults.map((r) => ({
      id: r.id,
      status: r.status,
      testedBy: r.testedBy,
      testedByName: r.testedByName,
      notes: r.notes,
      environment: r.environment,
      testedAt: r.testedAt.toISOString(),
    })),
    duplicateOf: bug.duplicateOf,
    createdAt: bug.createdAt.toISOString(),
    updatedAt: bug.updatedAt.toISOString(),
    resolvedAt: bug.resolvedAt?.toISOString(),
  };
}

// Create Bug Use Case
interface CreateBugInput {
  data: CreateBugRequest;
  userId: string;
  userName: string;
  workspaceId: string;
}

export class CreateBugUseCase
  implements UseCase<CreateBugInput, Result<BugDto>>
{
  constructor(
    private bugRepository: IBugRepository,
    private productRepository: IProductRepository
  ) {}

  async execute(input: CreateBugInput): Promise<Result<BugDto>> {
    const product = await this.productRepository.findById(input.data.productId);
    if (!product) {
      return Result.fail<BugDto>("Product not found");
    }

    if (product.workspaceId !== input.workspaceId) {
      return Result.fail<BugDto>("Product not found");
    }

    const bug = Bug.create({
      title: input.data.title,
      description: input.data.description,
      stepsToReproduce: input.data.stepsToReproduce,
      expectedBehavior: input.data.expectedBehavior,
      actualBehavior: input.data.actualBehavior,
      severity: input.data.severity,
      priority: input.data.priority,
      productId: input.data.productId,
      productName: product.name,
      platform: input.data.platform,
      reporterId: input.userId,
      reporterName: input.userName,
      environment: input.data.environment,
      version: input.data.version,
      browserInfo: input.data.browserInfo,
      workspaceId: input.workspaceId,
    });

    const savedBug = await this.bugRepository.save(bug);
    return Result.ok<BugDto>(mapBugToDto(savedBug));
  }
}

// Get Bugs Use Case
interface GetBugsInput {
  query: GetBugsQuery;
  workspaceId: string;
}

interface GetBugsResult {
  bugs: BugDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class GetBugsUseCase
  implements UseCase<GetBugsInput, Result<GetBugsResult>>
{
  constructor(private bugRepository: IBugRepository) {}

  async execute(input: GetBugsInput): Promise<Result<GetBugsResult>> {
    const page = input.query.page || 1;
    const limit = Math.min(input.query.limit || 20, 100);

    const { bugs, total } = await this.bugRepository.findAll(
      {
        status: input.query.status,
        severity: input.query.severity,
        priority: input.query.priority,
        productId: input.query.productId,
        platform: input.query.platform,
        assigneeId: input.query.assigneeId,
        reporterId: input.query.reporterId,
        sprintId: input.query.sprintId,
        search: input.query.search,
        workspaceId: input.workspaceId,
      },
      { sortBy: undefined, sortOrder: undefined },
      page,
      limit
    );

    const totalPages = Math.ceil(total / limit);

    return Result.ok<GetBugsResult>({
      bugs: bugs.map(mapBugToDto),
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

// Get Bug By ID Use Case
export class GetBugByIdUseCase implements UseCase<string, Result<BugDto>> {
  constructor(private bugRepository: IBugRepository) {}

  async execute(bugId: string): Promise<Result<BugDto>> {
    const bug = await this.bugRepository.findById(bugId);
    if (!bug) {
      return Result.fail<BugDto>("Bug not found");
    }
    return Result.ok<BugDto>(mapBugToDto(bug));
  }
}

// Update Bug Use Case
interface UpdateBugInput {
  bugId: string;
  data: UpdateBugRequest;
  workspaceId: string;
}

export class UpdateBugUseCase
  implements UseCase<UpdateBugInput, Result<BugDto>>
{
  constructor(private bugRepository: IBugRepository) {}

  async execute(input: UpdateBugInput): Promise<Result<BugDto>> {
    const bug = await this.bugRepository.findById(input.bugId);
    if (!bug) {
      return Result.fail<BugDto>("Bug not found");
    }

    if (bug.workspaceId !== input.workspaceId) {
      return Result.fail<BugDto>("Bug not found");
    }

    bug.update(
      input.data.title,
      input.data.description,
      input.data.severity,
      input.data.priority,
      input.data.stepsToReproduce,
      input.data.expectedBehavior,
      input.data.actualBehavior
    );

    const updatedBug = await this.bugRepository.save(bug);
    return Result.ok<BugDto>(mapBugToDto(updatedBug));
  }
}

// Update Bug Status Use Case
interface UpdateBugStatusInput {
  bugId: string;
  data: UpdateBugStatusRequest;
  workspaceId: string;
}

export class UpdateBugStatusUseCase
  implements UseCase<UpdateBugStatusInput, Result<BugDto>>
{
  constructor(private bugRepository: IBugRepository) {}

  async execute(input: UpdateBugStatusInput): Promise<Result<BugDto>> {
    const bug = await this.bugRepository.findById(input.bugId);
    if (!bug) {
      return Result.fail<BugDto>("Bug not found");
    }

    if (bug.workspaceId !== input.workspaceId) {
      return Result.fail<BugDto>("Bug not found");
    }

    bug.updateStatus(input.data.status);
    const updatedBug = await this.bugRepository.save(bug);
    return Result.ok<BugDto>(mapBugToDto(updatedBug));
  }
}

// Add Retest Result Use Case
interface AddRetestResultInput {
  bugId: string;
  data: AddRetestResultRequest;
  userId: string;
  userName: string;
  workspaceId: string;
}

export class AddRetestResultUseCase
  implements UseCase<AddRetestResultInput, Result<BugRetestResultDto>>
{
  constructor(private bugRepository: IBugRepository) {}

  async execute(
    input: AddRetestResultInput
  ): Promise<Result<BugRetestResultDto>> {
    const bug = await this.bugRepository.findById(input.bugId);
    if (!bug) {
      return Result.fail<BugRetestResultDto>("Bug not found");
    }

    if (bug.workspaceId !== input.workspaceId) {
      return Result.fail<BugRetestResultDto>("Bug not found");
    }

    const result = bug.addRetestResult(
      input.data.status,
      input.userId,
      input.userName,
      input.data.environment,
      input.data.notes
    );

    await this.bugRepository.save(bug);

    return Result.ok<BugRetestResultDto>({
      id: result.id,
      status: result.status,
      testedBy: result.testedBy,
      testedByName: result.testedByName,
      notes: result.notes,
      environment: result.environment,
      testedAt: result.testedAt.toISOString(),
    });
  }
}

// Get Bug Statistics Use Case
interface GetBugStatisticsInput {
  productId?: string;
  dateFrom?: string;
  dateTo?: string;
  workspaceId: string;
}

export class GetBugStatisticsUseCase
  implements UseCase<GetBugStatisticsInput, Result<BugStatisticsDto>>
{
  constructor(private bugRepository: IBugRepository) {}

  async execute(
    input: GetBugStatisticsInput
  ): Promise<Result<BugStatisticsDto>> {
    const stats = await this.bugRepository.getStatistics(
      input.productId,
      input.dateFrom ? new Date(input.dateFrom) : undefined,
      input.dateTo ? new Date(input.dateTo) : undefined
    );

    return Result.ok<BugStatisticsDto>(stats);
  }
}
