import { Response } from "express";
import { AuthRequest } from "@modules/auth/presentation/middlewares/authenticate";
import { ApiResponse } from "@infrastructure/http/responses/ApiResponse";
import {
  GetTeamMembersUseCase,
  GetTeamMemberByIdUseCase,
  InviteTeamMemberUseCase,
  UpdateTeamMemberUseCase,
  DeleteTeamMemberUseCase,
  GetPendingInvitationsUseCase,
  UpdateAvailabilityUseCase,
  UpdateSkillsUseCase,
  RequestTimeOffUseCase,
  GetTimeOffRequestsUseCase,
  GetWorkloadDistributionUseCase,
  SearchMembersBySkillsUseCase,
} from "@modules/team/application/use-cases/TeamUseCases";
import { TeamRepository } from "@modules/team/infrastructure/persistence/repositories/TeamRepository";
import { TaskRepository } from "@modules/tasks/infrastructure/persistence/repositories/TaskRepository";
import { BugRepository } from "@modules/bugs/infrastructure/persistence/repositories/BugRepository";

export class TeamController {
  private getTeamMembersUseCase: GetTeamMembersUseCase;
  private getTeamMemberByIdUseCase: GetTeamMemberByIdUseCase;
  private inviteTeamMemberUseCase: InviteTeamMemberUseCase;
  private updateTeamMemberUseCase: UpdateTeamMemberUseCase;
  private deleteTeamMemberUseCase: DeleteTeamMemberUseCase;
  private getPendingInvitationsUseCase: GetPendingInvitationsUseCase;
  private updateAvailabilityUseCase: UpdateAvailabilityUseCase;
  private updateSkillsUseCase: UpdateSkillsUseCase;
  private requestTimeOffUseCase: RequestTimeOffUseCase;
  private getTimeOffRequestsUseCase: GetTimeOffRequestsUseCase;
  private getWorkloadDistributionUseCase: GetWorkloadDistributionUseCase;
  private searchMembersBySkillsUseCase: SearchMembersBySkillsUseCase;

  constructor() {
    const teamRepository = new TeamRepository();
    const taskRepository = new TaskRepository();
    const bugRepository = new BugRepository();

    this.getTeamMembersUseCase = new GetTeamMembersUseCase(teamRepository);
    this.getTeamMemberByIdUseCase = new GetTeamMemberByIdUseCase(
      teamRepository
    );
    this.inviteTeamMemberUseCase = new InviteTeamMemberUseCase(teamRepository);
    this.updateTeamMemberUseCase = new UpdateTeamMemberUseCase(teamRepository);
    this.deleteTeamMemberUseCase = new DeleteTeamMemberUseCase(teamRepository);
    this.getPendingInvitationsUseCase = new GetPendingInvitationsUseCase(
      teamRepository
    );
    this.updateAvailabilityUseCase = new UpdateAvailabilityUseCase(
      teamRepository
    );
    this.updateSkillsUseCase = new UpdateSkillsUseCase(teamRepository);
    this.requestTimeOffUseCase = new RequestTimeOffUseCase(teamRepository);
    this.getTimeOffRequestsUseCase = new GetTimeOffRequestsUseCase(
      teamRepository
    );
    this.getWorkloadDistributionUseCase = new GetWorkloadDistributionUseCase(
      teamRepository,
      taskRepository,
      bugRepository
    );
    this.searchMembersBySkillsUseCase = new SearchMembersBySkillsUseCase(
      teamRepository
    );
  }

  getTeamMembers = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getTeamMembersUseCase.execute(
        req.user.workspaceId
      );

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get team members error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getTeamMemberById = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getTeamMemberByIdUseCase.execute(req.params.id);

      if (result.isFailure) {
        return ApiResponse.notFound(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get team member by id error:", error);
      return ApiResponse.internalError(res);
    }
  };

  inviteTeamMember = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.inviteTeamMemberUseCase.execute({
        data: req.body,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.created(res, result.getValue());
    } catch (error) {
      console.error("Invite team member error:", error);
      return ApiResponse.internalError(res);
    }
  };

  updateTeamMember = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.updateTeamMemberUseCase.execute({
        memberId: req.params.id,
        data: req.body,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Update team member error:", error);
      return ApiResponse.internalError(res);
    }
  };

  deleteTeamMember = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.deleteTeamMemberUseCase.execute({
        memberId: req.params.id,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.notFound(res, result.error!);
      }

      return ApiResponse.noContent(res);
    } catch (error) {
      console.error("Delete team member error:", error);
      return ApiResponse.internalError(res);
    }
  };

  resendInvitation = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement email sending logic
      return ApiResponse.success(res, { message: "Invitation resent" });
    } catch (error) {
      console.error("Resend invitation error:", error);
      return ApiResponse.internalError(res);
    }
  };

  cancelInvitation = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.deleteTeamMemberUseCase.execute({
        memberId: req.params.id,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.notFound(res, result.error!);
      }

      return ApiResponse.noContent(res);
    } catch (error) {
      console.error("Cancel invitation error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getPendingInvitations = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getPendingInvitationsUseCase.execute(
        req.user.workspaceId
      );

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get pending invitations error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getMemberRoles = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getTeamMemberByIdUseCase.execute(req.params.id);

      if (result.isFailure) {
        return ApiResponse.notFound(res, result.error!);
      }

      const member = result.getValue();
      return ApiResponse.success(res, [member.role]);
    } catch (error) {
      console.error("Get member roles error:", error);
      return ApiResponse.internalError(res);
    }
  };

  assignRole = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.updateTeamMemberUseCase.execute({
        memberId: req.params.id,
        data: { role: req.body.role },
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Assign role error:", error);
      return ApiResponse.internalError(res);
    }
  };

  removeRole = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // In this simplified version, we just return success
      // In a full implementation, you'd handle multiple roles per member
      return ApiResponse.success(res, { message: "Role removed" });
    } catch (error) {
      console.error("Remove role error:", error);
      return ApiResponse.internalError(res);
    }
  };

  updateAvailability = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.updateAvailabilityUseCase.execute({
        memberId: req.params.id,
        data: req.body,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Update availability error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getMemberTasks = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Fetch actual tasks for the member
      return ApiResponse.success(res, []);
    } catch (error) {
      console.error("Get member tasks error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getMemberBugs = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Fetch actual bugs for the member
      return ApiResponse.success(res, []);
    } catch (error) {
      console.error("Get member bugs error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getWorkloadDistribution = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getWorkloadDistributionUseCase.execute(
        req.user.workspaceId
      );

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, { data: result.getValue() });
    } catch (error) {
      console.error("Get workload distribution error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getTeamCalendar = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      // TODO: Implement calendar aggregation from sprints, releases, time off
      return ApiResponse.success(res, []);
    } catch (error) {
      console.error("Get team calendar error:", error);
      return ApiResponse.internalError(res);
    }
  };

  requestTimeOff = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.requestTimeOffUseCase.execute({
        memberId: req.params.id,
        data: req.body,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.created(res, result.getValue());
    } catch (error) {
      console.error("Request time off error:", error);
      return ApiResponse.internalError(res);
    }
  };

  getTimeOffRequests = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.getTimeOffRequestsUseCase.execute(
        req.user.workspaceId
      );

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Get time off requests error:", error);
      return ApiResponse.internalError(res);
    }
  };

  updateSkills = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const result = await this.updateSkillsUseCase.execute({
        memberId: req.params.id,
        data: req.body,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Update skills error:", error);
      return ApiResponse.internalError(res);
    }
  };

  searchMembers = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }

      const skills = (req.query.skills as string)
        .split(",")
        .map((s) => s.trim());

      const result = await this.searchMembersBySkillsUseCase.execute({
        skills,
        workspaceId: req.user.workspaceId,
      });

      if (result.isFailure) {
        return ApiResponse.badRequest(res, result.error!);
      }

      return ApiResponse.success(res, result.getValue());
    } catch (error) {
      console.error("Search members error:", error);
      return ApiResponse.internalError(res);
    }
  };
}
