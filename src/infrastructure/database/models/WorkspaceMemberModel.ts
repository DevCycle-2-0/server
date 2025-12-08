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
  UpdatedAt,
  Unique,
} from 'sequelize-typescript';
import { WorkspaceModel } from './WorkspaceModel';
import { UserModel } from './UserModel';
import { AppRole } from '@shared/types';

@Table({ tableName: 'workspace_members', timestamps: true })
export class WorkspaceMemberModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => WorkspaceModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  workspaceId!: string;

  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  userId!: string;

  @Default(AppRole.MEMBER)
  @Column(DataType.ENUM(...Object.values(AppRole)))
  role!: AppRole;

  @CreatedAt
  @Column({ field: 'joined_at' })
  joinedAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BelongsTo(() => WorkspaceModel, 'workspaceId')
  workspace!: WorkspaceModel;

  @BelongsTo(() => UserModel, 'userId')
  user!: UserModel;
}
