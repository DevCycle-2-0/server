import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  Unique,
} from 'sequelize-typescript';
import { WorkspaceModel } from './WorkspaceModel';
import { UserModel } from './UserModel';
import { AppRole } from '@shared/types';

export enum InviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Table({ tableName: 'workspace_invites', timestamps: true, updatedAt: false })
export class WorkspaceInviteModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => WorkspaceModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  workspaceId!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  email!: string;

  @Default(AppRole.MEMBER)
  @Column(DataType.ENUM(...Object.values(AppRole)))
  role!: AppRole;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  token!: string;

  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  invitedBy!: string;

  @Default(InviteStatus.PENDING)
  @Column(DataType.ENUM(...Object.values(InviteStatus)))
  status!: InviteStatus;

  @AllowNull(false)
  @Column(DataType.DATE)
  expiresAt!: Date;

  @CreatedAt
  createdAt!: Date;

  @BelongsTo(() => WorkspaceModel, 'workspaceId')
  workspace!: WorkspaceModel;

  @BelongsTo(() => UserModel, 'invitedBy')
  inviter!: UserModel;
}
