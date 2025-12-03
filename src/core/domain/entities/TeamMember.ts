import { BaseEntity } from './BaseEntity';
import { ValidationError } from '@core/shared/errors/DomainError';

export enum AvailabilityStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  AWAY = 'away',
  OFFLINE = 'offline',
}

interface TeamMemberProps {
  userId: string;
  workspaceId: string;
  role: string;
  department?: string;
  title?: string;
  skills: string[];
  availability: AvailabilityStatus;
  workload: number;
  capacity: number;
}

export class TeamMember extends BaseEntity<TeamMemberProps> {
  private constructor(
    id: string,
    private props: TeamMemberProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(userId: string, workspaceId: string, role: string, id?: string): TeamMember {
    return new TeamMember(id || crypto.randomUUID(), {
      userId,
      workspaceId,
      role,
      skills: [],
      availability: AvailabilityStatus.AVAILABLE,
      workload: 0,
      capacity: 100,
    });
  }

  updateAvailability(status: AvailabilityStatus): void {
    this.props.availability = status;
    this.touch();
  }

  updateSkills(skills: string[]): void {
    this.props.skills = skills;
    this.touch();
  }

  updateWorkload(workload: number): void {
    if (workload < 0 || workload > 100) {
      throw new ValidationError('Workload must be between 0 and 100');
    }
    this.props.workload = workload;
    this.touch();
  }

  // Getters
  get userId(): string {
    return this.props.userId;
  }
  get workspaceId(): string {
    return this.props.workspaceId;
  }
  get role(): string {
    return this.props.role;
  }
  get skills(): string[] {
    return [...this.props.skills];
  }
  get availability(): AvailabilityStatus {
    return this.props.availability;
  }
  get workload(): number {
    return this.props.workload;
  }
}
