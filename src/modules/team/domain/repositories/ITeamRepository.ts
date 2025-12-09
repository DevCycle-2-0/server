import { TeamMember, MemberStatus } from "../entities/TeamMember";

export interface TeamMemberFilters {
  status?: MemberStatus;
  role?: string;
  skills?: string[];
  workspaceId: string;
}

export interface ITeamRepository {
  findById(id: string): Promise<TeamMember | null>;
  findByUserId(userId: string, workspaceId: string): Promise<TeamMember | null>;
  findByEmail(email: string, workspaceId: string): Promise<TeamMember | null>;
  findAll(filters: TeamMemberFilters): Promise<TeamMember[]>;
  findBySkills(skills: string[], workspaceId: string): Promise<TeamMember[]>;
  save(member: TeamMember): Promise<TeamMember>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}
