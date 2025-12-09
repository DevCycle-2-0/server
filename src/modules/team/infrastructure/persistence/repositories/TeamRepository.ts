import { BaseRepository } from "@shared/infrastructure/BaseRepository";
import { ITeamRepository } from "@modules/team/domain/repositories/ITeamRepository";

import {
  TeamMember,
  TeamRole,
  Permission,
  MemberStatus,
  WorkloadItem,
  AvailabilitySlot,
  TimeOffRequest,
} from "@modules/team/domain/entities/TeamMember";
import { TeamMemberModel } from "../models/TeamMemberModel";
import { Op } from "sequelize";

export class TeamRepository
  extends BaseRepository<TeamMember, TeamMemberModel>
  implements ITeamRepository
{
  constructor() {
    super(TeamMemberModel);
  }

  protected toDomain(model: TeamMemberModel): TeamMember {
    const member = TeamMember.create(
      {
        userId: model.userId,
        name: model.name,
        email: model.email,
        role: model.role as TeamRole,
        workspaceId: model.workspaceId,
        avatar: model.avatar,
        skills: model.skills,
        status: model.status as MemberStatus,
      },
      model.id
    );

    // Restore complex properties
    (member as any).props.permissions = model.permissions as Permission[];
    (member as any).props.workload = model.workload as WorkloadItem[];
    (member as any).props.availability =
      model.availability as AvailabilitySlot[];
    (member as any).props.timeOffRequests =
      model.timeOffRequests as TimeOffRequest[];
    (member as any).props.joinedAt = model.joinedAt;
    (member as any).props.lastActive = model.lastActive;
    (member as any).props.createdAt = model.createdAt;
    (member as any).props.updatedAt = model.updatedAt;

    return member;
  }

  protected toModel(domain: TeamMember): Partial<TeamMemberModel> {
    return {
      id: domain.id,
      userId: domain.userId,
      name: domain.name,
      email: domain.email,
      avatar: domain.avatar,
      role: domain.role,
      permissions: domain.permissions as any,
      skills: domain.skills,
      workload: domain.workload as any,
      availability: domain.availability as any,
      timeOffRequests: domain.timeOffRequests as any,
      status: domain.status,
      joinedAt: domain.joinedAt,
      lastActive: domain.lastActive,
      workspaceId: domain.workspaceId,
    };
  }

  async findByUserId(
    userId: string,
    workspaceId: string
  ): Promise<TeamMember | null> {
    const model = await this.model.findOne({
      where: { userId, workspaceId },
    });
    return model ? this.toDomain(model) : null;
  }

  async findByEmail(
    email: string,
    workspaceId: string
  ): Promise<TeamMember | null> {
    const model = await this.model.findOne({
      where: { email, workspaceId },
    });
    return model ? this.toDomain(model) : null;
  }

  async findAll(filters: any): Promise<TeamMember[]> {
    const where: any = {
      workspaceId: filters.workspaceId,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.skills && filters.skills.length > 0) {
      where.skills = {
        [Op.contains]: filters.skills,
      };
    }

    const models = await this.model.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    return models.map((model) => this.toDomain(model));
  }

  async findBySkills(
    skills: string[],
    workspaceId: string
  ): Promise<TeamMember[]> {
    const models = await this.model.findAll({
      where: {
        workspaceId,
        skills: {
          [Op.overlap]: skills,
        },
      },
      order: [["createdAt", "DESC"]],
    });

    return models.map((model) => this.toDomain(model));
  }
}
