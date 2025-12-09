import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/application/Result";
import { ITeamRepository } from "@modules/team/domain/repositories/ITeamRepository";
import { ITaskRepository } from "@modules/tasks/domain/repositories/ITaskRepository";
import { IBugRepository } from "@modules/bugs/domain/repositories/IBugRepository";
import { TeamMember } from "@modules/team/domain/entities/TeamMember";
import {
  TeamMemberDto,
  InviteTeamMemberRequest,
  UpdateTeamMemberRequest,
  UpdateAvailabilityRequest,
  UpdateSkillsRequest,
  CreateTimeOffRequest,
  TimeOffRequestDto,
  WorkloadSummaryDto,
  AvailabilitySlotDto,
} from "../dtos/TeamDtos";
import { v4 as uuidv4 } from "uuid";

// Helper function
function mapToDto(
  member: TeamMember,
  includeTimeOff: boolean = false
): TeamMemberDto {
  return {
    id: member.id,
    userId: member.userId,
    name: member.name,
    email: member.email,
    avatar: member.avatar,
    role: member.role,
    permissions: member.permissions,
    skills: member.skills,
    workload: member.workload.map((w) => ({
      id: w.id,
      taskId: w.taskId,
      taskTitle: w.taskTitle,
      estimatedHours: w.estimatedHours,
      dueDate: w.dueDate.toISOString(),
      status: w.status,
    })),
    availability: member.availability.map((a) => ({
      id: a.id,
      date: a.date.toISOString().split("T")[0],
      status: a.status,
      notes: a.notes,
    })),
    timeOffRequests: includeTimeOff
      ? member.timeOffRequests.map((t) => ({
          id: t.id,
          startDate: t.startDate.toISOString().split("T")[0],
          endDate: t.endDate.toISOString().split("T")[0],
          type: t.type,
          status: t.status,
          reason: t.reason,
          createdAt: t.createdAt.toISOString(),
        }))
      : undefined,
    status: member.status,
    joinedAt: member.joinedAt.toISOString(),
    lastActive: member.lastActive.toISOString(),
  };
}

// Get All Team Members
export class GetTeamMembersUseCase
  implements UseCase<string, Result<TeamMemberDto[]>>
{
  constructor(private teamRepository: ITeamRepository) {}

  async execute(workspaceId: string): Promise<Result<TeamMemberDto[]>> {
    const members = await this.teamRepository.findAll({ workspaceId });
    return Result.ok<TeamMemberDto[]>(members.map((m) => mapToDto(m)));
  }
}

// Get Team Member By ID
export class GetTeamMemberByIdUseCase
  implements UseCase<string, Result<TeamMemberDto>>
{
  constructor(private teamRepository: ITeamRepository) {}

  async execute(memberId: string): Promise<Result<TeamMemberDto>> {
    const member = await this.teamRepository.findById(memberId);
    if (!member) {
      return Result.fail<TeamMemberDto>("Team member not found");
    }
    return Result.ok<TeamMemberDto>(mapToDto(member, true));
  }
}

// Invite Team Member
interface InviteTeamMemberInput {
  data: InviteTeamMemberRequest;
  workspaceId: string;
}

export class InviteTeamMemberUseCase
  implements UseCase<InviteTeamMemberInput, Result<TeamMemberDto>>
{
  constructor(private teamRepository: ITeamRepository) {}

  async execute(input: InviteTeamMemberInput): Promise<Result<TeamMemberDto>> {
    // Check if email already exists
    const existing = await this.teamRepository.findByEmail(
      input.data.email,
      input.workspaceId
    );
    if (existing) {
      return Result.fail<TeamMemberDto>(
        "Team member with this email already exists"
      );
    }

    // Create temporary user ID for invited member
    const tempUserId = uuidv4();

    const member = TeamMember.create({
      userId: tempUserId,
      name: input.data.name,
      email: input.data.email,
      role: input.data.role,
      workspaceId: input.workspaceId,
      status: "invited",
    });

    const saved = await this.teamRepository.save(member);
    return Result.ok<TeamMemberDto>(mapToDto(saved));
  }
}

// Update Team Member
interface UpdateTeamMemberInput {
  memberId: string;
  data: UpdateTeamMemberRequest;
  workspaceId: string;
}

export class UpdateTeamMemberUseCase
  implements UseCase<UpdateTeamMemberInput, Result<TeamMemberDto>>
{
  constructor(private teamRepository: ITeamRepository) {}

  async execute(input: UpdateTeamMemberInput): Promise<Result<TeamMemberDto>> {
    const member = await this.teamRepository.findById(input.memberId);
    if (!member) {
      return Result.fail<TeamMemberDto>("Team member not found");
    }

    if (member.workspaceId !== input.workspaceId) {
      return Result.fail<TeamMemberDto>("Team member not found");
    }

    member.update(input.data.name, input.data.avatar, input.data.skills);
    if (input.data.role) {
      member.updateRole(input.data.role);
    }

    const updated = await this.teamRepository.save(member);
    return Result.ok<TeamMemberDto>(mapToDto(updated));
  }
}

// Delete Team Member
interface DeleteTeamMemberInput {
  memberId: string;
  workspaceId: string;
}

export class DeleteTeamMemberUseCase
  implements UseCase<DeleteTeamMemberInput, Result<void>>
{
  constructor(private teamRepository: ITeamRepository) {}

  async execute(input: DeleteTeamMemberInput): Promise<Result<void>> {
    const member = await this.teamRepository.findById(input.memberId);
    if (!member) {
      return Result.fail<void>("Team member not found");
    }

    if (member.workspaceId !== input.workspaceId) {
      return Result.fail<void>("Team member not found");
    }

    await this.teamRepository.delete(input.memberId);
    return Result.ok<void>();
  }
}

// Get Pending Invitations
export class GetPendingInvitationsUseCase
  implements UseCase<string, Result<TeamMemberDto[]>>
{
  constructor(private teamRepository: ITeamRepository) {}

  async execute(workspaceId: string): Promise<Result<TeamMemberDto[]>> {
    const members = await this.teamRepository.findAll({
      workspaceId,
      status: "invited",
    });
    return Result.ok<TeamMemberDto[]>(members.map((m) => mapToDto(m)));
  }
}

// Update Availability
interface UpdateAvailabilityInput {
  memberId: string;
  data: UpdateAvailabilityRequest;
  workspaceId: string;
}

export class UpdateAvailabilityUseCase
  implements UseCase<UpdateAvailabilityInput, Result<TeamMemberDto>>
{
  constructor(private teamRepository: ITeamRepository) {}

  async execute(
    input: UpdateAvailabilityInput
  ): Promise<Result<TeamMemberDto>> {
    const member = await this.teamRepository.findById(input.memberId);
    if (!member) {
      return Result.fail<TeamMemberDto>("Team member not found");
    }

    if (member.workspaceId !== input.workspaceId) {
      return Result.fail<TeamMemberDto>("Team member not found");
    }

    const availability = input.data.availability.map((a) => ({
      id: uuidv4(),
      date: new Date(a.date),
      status: a.status,
      notes: a.notes,
    }));

    member.updateAvailability(availability);
    const updated = await this.teamRepository.save(member);
    return Result.ok<TeamMemberDto>(mapToDto(updated));
  }
}

// Update Skills
interface UpdateSkillsInput {
  memberId: string;
  data: UpdateSkillsRequest;
  workspaceId: string;
}

export class UpdateSkillsUseCase
  implements UseCase<UpdateSkillsInput, Result<TeamMemberDto>>
{
  constructor(private teamRepository: ITeamRepository) {}

  async execute(input: UpdateSkillsInput): Promise<Result<TeamMemberDto>> {
    const member = await this.teamRepository.findById(input.memberId);
    if (!member) {
      return Result.fail<TeamMemberDto>("Team member not found");
    }

    if (member.workspaceId !== input.workspaceId) {
      return Result.fail<TeamMemberDto>("Team member not found");
    }

    member.updateSkills(input.data.skills);
    const updated = await this.teamRepository.save(member);
    return Result.ok<TeamMemberDto>(mapToDto(updated));
  }
}

// Request Time Off
interface RequestTimeOffInput {
  memberId: string;
  data: CreateTimeOffRequest;
  workspaceId: string;
}

export class RequestTimeOffUseCase
  implements UseCase<RequestTimeOffInput, Result<TimeOffRequestDto>>
{
  constructor(private teamRepository: ITeamRepository) {}

  async execute(
    input: RequestTimeOffInput
  ): Promise<Result<TimeOffRequestDto>> {
    const member = await this.teamRepository.findById(input.memberId);
    if (!member) {
      return Result.fail<TimeOffRequestDto>("Team member not found");
    }

    if (member.workspaceId !== input.workspaceId) {
      return Result.fail<TimeOffRequestDto>("Team member not found");
    }

    const request = member.requestTimeOff(
      new Date(input.data.startDate),
      new Date(input.data.endDate),
      input.data.type,
      input.data.reason
    );

    await this.teamRepository.save(member);

    return Result.ok<TimeOffRequestDto>({
      id: request.id,
      startDate: request.startDate.toISOString().split("T")[0],
      endDate: request.endDate.toISOString().split("T")[0],
      type: request.type,
      status: request.status,
      reason: request.reason,
      createdAt: request.createdAt.toISOString(),
    });
  }
}

// Get All Time Off Requests
export class GetTimeOffRequestsUseCase
  implements UseCase<string, Result<TimeOffRequestDto[]>>
{
  constructor(private teamRepository: ITeamRepository) {}

  async execute(workspaceId: string): Promise<Result<TimeOffRequestDto[]>> {
    const members = await this.teamRepository.findAll({ workspaceId });

    const allRequests: TimeOffRequestDto[] = [];
    for (const member of members) {
      for (const request of member.timeOffRequests) {
        allRequests.push({
          id: request.id,
          startDate: request.startDate.toISOString().split("T")[0],
          endDate: request.endDate.toISOString().split("T")[0],
          type: request.type,
          status: request.status,
          reason: request.reason,
          createdAt: request.createdAt.toISOString(),
        });
      }
    }

    return Result.ok<TimeOffRequestDto[]>(allRequests);
  }
}

// Get Workload Distribution
export class GetWorkloadDistributionUseCase
  implements UseCase<string, Result<WorkloadSummaryDto[]>>
{
  constructor(
    private teamRepository: ITeamRepository,
    private taskRepository: ITaskRepository,
    private bugRepository: IBugRepository
  ) {}

  async execute(workspaceId: string): Promise<Result<WorkloadSummaryDto[]>> {
    const members = await this.teamRepository.findAll({
      workspaceId,
      status: "active",
    });

    const workloadSummaries: WorkloadSummaryDto[] = [];

    for (const member of members) {
      const totalHours = member.workload.reduce(
        (sum, w) => sum + w.estimatedHours,
        0
      );
      const taskCount = member.workload.length;

      // Get bugs assigned to this member
      const bugs = await this.bugRepository.findAll(
        {
          assigneeId: member.userId,
          workspaceId,
        },
        { sortBy: undefined, sortOrder: undefined },
        1,
        1000
      );

      const capacity = 40; // Standard 40-hour work week
      const utilizationPercent = (totalHours / capacity) * 100;

      workloadSummaries.push({
        memberId: member.id,
        memberName: member.name,
        totalHours,
        capacity,
        utilizationPercent: Math.round(utilizationPercent * 100) / 100,
        taskCount,
        bugCount: bugs.bugs.length,
      });
    }

    return Result.ok<WorkloadSummaryDto[]>(workloadSummaries);
  }
}

// Search Members by Skills
interface SearchMembersInput {
  skills: string[];
  workspaceId: string;
}

export class SearchMembersBySkillsUseCase
  implements UseCase<SearchMembersInput, Result<TeamMemberDto[]>>
{
  constructor(private teamRepository: ITeamRepository) {}

  async execute(input: SearchMembersInput): Promise<Result<TeamMemberDto[]>> {
    const members = await this.teamRepository.findBySkills(
      input.skills,
      input.workspaceId
    );
    return Result.ok<TeamMemberDto[]>(members.map((m) => mapToDto(m)));
  }
}
