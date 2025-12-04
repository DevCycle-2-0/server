// src/core/domain/entities/WorkspaceInvite.ts
import { BaseEntity } from './BaseEntity';
import { ValidationError } from '@core/shared/errors/DomainError';
import { UserRole } from '../value-objects/Role';

export enum InviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

interface WorkspaceInviteProps {
  workspaceId: string;
  email: string;
  role: UserRole;
  invitedBy: string;
  status: InviteStatus;
  token: string;
  expiresAt: Date;
}

export class WorkspaceInvite extends BaseEntity<WorkspaceInviteProps> {
  private constructor(
    id: string,
    private props: WorkspaceInviteProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(
    workspaceId: string,
    email: string,
    role: UserRole,
    invitedBy: string,
    id?: string
  ): WorkspaceInvite {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }

    if (!Object.values(UserRole).includes(role)) {
      throw new ValidationError(`Invalid role: ${role}`);
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    return new WorkspaceInvite(id || crypto.randomUUID(), {
      workspaceId,
      email: email.toLowerCase().trim(),
      role,
      invitedBy,
      status: InviteStatus.PENDING,
      token,
      expiresAt,
    });
  }

  static reconstitute(
    id: string,
    workspaceId: string,
    email: string,
    role: UserRole,
    invitedBy: string,
    status: InviteStatus,
    token: string,
    expiresAt: Date,
    createdAt: Date,
    updatedAt: Date
  ): WorkspaceInvite {
    return new WorkspaceInvite(
      id,
      {
        workspaceId,
        email,
        role,
        invitedBy,
        status,
        token,
        expiresAt,
      },
      createdAt,
      updatedAt
    );
  }

  accept(): void {
    if (this.props.status !== InviteStatus.PENDING) {
      throw new ValidationError('Invite is not pending');
    }

    if (this.isExpired()) {
      throw new ValidationError('Invite has expired');
    }

    this.props.status = InviteStatus.ACCEPTED;
    this.touch();
  }

  cancel(): void {
    if (this.props.status !== InviteStatus.PENDING) {
      throw new ValidationError('Can only cancel pending invites');
    }

    this.props.status = InviteStatus.CANCELLED;
    this.touch();
  }

  markExpired(): void {
    this.props.status = InviteStatus.EXPIRED;
    this.touch();
  }

  isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }

  // Getters
  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get email(): string {
    return this.props.email;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get invitedBy(): string {
    return this.props.invitedBy;
  }

  get status(): InviteStatus {
    return this.props.status;
  }

  get token(): string {
    return this.props.token;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }
}
