import {
  TeamRole,
  Permission,
  MemberStatus,
} from "@modules/team/domain/entities/TeamMember";

export interface WorkloadItemDto {
  id: string;
  taskId: string;
  taskTitle: string;
  estimatedHours: number;
  dueDate: string;
  status: string;
}

export interface AvailabilitySlotDto {
  id: string;
  date: string;
  status: "available" | "busy" | "out_of_office";
  notes?: string;
}

export interface TimeOffRequestDto {
  id: string;
  startDate: string;
  endDate: string;
  type: "vacation" | "sick" | "personal" | "other";
  status: "pending" | "approved" | "rejected";
  reason?: string;
  createdAt: string;
}

export interface TeamMemberDto {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: TeamRole;
  permissions: Permission[];
  skills: string[];
  workload: WorkloadItemDto[];
  availability: AvailabilitySlotDto[];
  timeOffRequests?: TimeOffRequestDto[];
  status: MemberStatus;
  joinedAt: string;
  lastActive: string;
}

export interface InviteTeamMemberRequest {
  email: string;
  name: string;
  role: TeamRole;
}

export interface UpdateTeamMemberRequest {
  name?: string;
  role?: TeamRole;
  skills?: string[];
  avatar?: string;
}

export interface AssignRoleRequest {
  role: TeamRole;
}

export interface UpdateAvailabilityRequest {
  availability: Array<{
    date: string;
    status: "available" | "busy" | "out_of_office";
    notes?: string;
  }>;
}

export interface UpdateSkillsRequest {
  skills: string[];
}

export interface CreateTimeOffRequest {
  startDate: string;
  endDate: string;
  type: "vacation" | "sick" | "personal" | "other";
  reason?: string;
}

export interface WorkloadSummaryDto {
  memberId: string;
  memberName: string;
  totalHours: number;
  capacity: number;
  utilizationPercent: number;
  taskCount: number;
  bugCount: number;
}

export interface CalendarEventDto {
  id: string;
  type: "sprint" | "release" | "meeting" | "timeoff";
  title: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  memberId?: string;
}

export interface SearchMembersQuery {
  skills?: string;
}
