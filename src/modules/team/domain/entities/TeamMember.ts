import { AggregateRoot } from "@shared/domain/AggregateRoot";
import { v4 as uuidv4 } from "uuid";

export type TeamRole =
  | "business_owner"
  | "product_owner"
  | "technical_leader"
  | "ui_ux_designer"
  | "frontend_dev"
  | "backend_dev"
  | "mobile_android"
  | "mobile_ios"
  | "qa_tester"
  | "project_manager";

export type Permission =
  | "view_only"
  | "edit"
  | "approve"
  | "delete"
  | "manage_users";

export type MemberStatus = "active" | "invited" | "inactive";

export interface WorkloadItem {
  id: string;
  taskId: string;
  taskTitle: string;
  estimatedHours: number;
  dueDate: Date;
  status: string;
}

export interface AvailabilitySlot {
  id: string;
  date: Date;
  status: "available" | "busy" | "out_of_office";
  notes?: string;
}

export interface TimeOffRequest {
  id: string;
  startDate: Date;
  endDate: Date;
  type: "vacation" | "sick" | "personal" | "other";
  status: "pending" | "approved" | "rejected";
  reason?: string;
  createdAt: Date;
}

interface TeamMemberProps {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: TeamRole;
  permissions: Permission[];
  skills: string[];
  workload: WorkloadItem[];
  availability: AvailabilitySlot[];
  timeOffRequests: TimeOffRequest[];
  status: MemberStatus;
  joinedAt: Date;
  lastActive: Date;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class TeamMember extends AggregateRoot<TeamMemberProps> {
  private constructor(props: TeamMemberProps, id?: string) {
    super(props, id);
  }

  protected generateId(): string {
    return uuidv4();
  }

  get userId(): string {
    return this.props.userId;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get avatar(): string | undefined {
    return this.props.avatar;
  }

  get role(): TeamRole {
    return this.props.role;
  }

  get permissions(): Permission[] {
    return this.props.permissions;
  }

  get skills(): string[] {
    return this.props.skills;
  }

  get workload(): WorkloadItem[] {
    return this.props.workload;
  }

  get availability(): AvailabilitySlot[] {
    return this.props.availability;
  }

  get timeOffRequests(): TimeOffRequest[] {
    return this.props.timeOffRequests;
  }

  get status(): MemberStatus {
    return this.props.status;
  }

  get joinedAt(): Date {
    return this.props.joinedAt;
  }

  get lastActive(): Date {
    return this.props.lastActive;
  }

  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public update(name?: string, avatar?: string, skills?: string[]): void {
    if (name) this.props.name = name;
    if (avatar !== undefined) this.props.avatar = avatar;
    if (skills) this.props.skills = skills;
    this.props.updatedAt = new Date();
  }

  public updateRole(role: TeamRole): void {
    this.props.role = role;
    this.props.updatedAt = new Date();
  }

  public updatePermissions(permissions: Permission[]): void {
    this.props.permissions = permissions;
    this.props.updatedAt = new Date();
  }

  public updateSkills(skills: string[]): void {
    this.props.skills = skills;
    this.props.updatedAt = new Date();
  }

  public updateAvailability(availability: AvailabilitySlot[]): void {
    this.props.availability = availability;
    this.props.updatedAt = new Date();
  }

  public activate(): void {
    this.props.status = "active";
    this.props.joinedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public deactivate(): void {
    this.props.status = "inactive";
    this.props.updatedAt = new Date();
  }

  public updateLastActive(): void {
    this.props.lastActive = new Date();
  }

  public addWorkloadItem(item: WorkloadItem): void {
    this.props.workload.push(item);
    this.props.updatedAt = new Date();
  }

  public removeWorkloadItem(taskId: string): boolean {
    const index = this.props.workload.findIndex((w) => w.taskId === taskId);
    if (index === -1) return false;
    this.props.workload.splice(index, 1);
    this.props.updatedAt = new Date();
    return true;
  }

  public requestTimeOff(
    startDate: Date,
    endDate: Date,
    type: "vacation" | "sick" | "personal" | "other",
    reason?: string
  ): TimeOffRequest {
    const request: TimeOffRequest = {
      id: uuidv4(),
      startDate,
      endDate,
      type,
      status: "pending",
      reason,
      createdAt: new Date(),
    };
    this.props.timeOffRequests.push(request);
    this.props.updatedAt = new Date();
    return request;
  }

  public approveTimeOff(requestId: string): boolean {
    const request = this.props.timeOffRequests.find((r) => r.id === requestId);
    if (!request) return false;
    request.status = "approved";
    this.props.updatedAt = new Date();
    return true;
  }

  public rejectTimeOff(requestId: string): boolean {
    const request = this.props.timeOffRequests.find((r) => r.id === requestId);
    if (!request) return false;
    request.status = "rejected";
    this.props.updatedAt = new Date();
    return true;
  }

  public static create(
    props: {
      userId: string;
      name: string;
      email: string;
      role: TeamRole;
      workspaceId: string;
      avatar?: string;
      skills?: string[];
      status?: MemberStatus;
    },
    id?: string
  ): TeamMember {
    const defaultPermissions = TeamMember.getDefaultPermissions(props.role);

    return new TeamMember(
      {
        userId: props.userId,
        name: props.name,
        email: props.email,
        avatar: props.avatar,
        role: props.role,
        permissions: defaultPermissions,
        skills: props.skills || [],
        workload: [],
        availability: [],
        timeOffRequests: [],
        status: props.status || "invited",
        joinedAt: new Date(),
        lastActive: new Date(),
        workspaceId: props.workspaceId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id
    );
  }

  private static getDefaultPermissions(role: TeamRole): Permission[] {
    const permissionMap: Record<TeamRole, Permission[]> = {
      business_owner: [
        "view_only",
        "edit",
        "approve",
        "delete",
        "manage_users",
      ],
      product_owner: ["view_only", "edit", "approve"],
      technical_leader: ["view_only", "edit", "approve"],
      project_manager: ["view_only", "edit", "approve", "manage_users"],
      ui_ux_designer: ["view_only", "edit"],
      frontend_dev: ["view_only", "edit"],
      backend_dev: ["view_only", "edit"],
      mobile_android: ["view_only", "edit"],
      mobile_ios: ["view_only", "edit"],
      qa_tester: ["view_only", "edit"],
    };

    return permissionMap[role] || ["view_only"];
  }
}
