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
  Unique,
} from 'sequelize-typescript';
import { WorkspaceModel } from './WorkspaceModel';
import { UserModel } from './UserModel';

@Table({
  tableName: 'workspace_invites',
  timestamps: true,
})
export class WorkspaceInviteModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => WorkspaceModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  workspace_id!: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  email!: string;

  @AllowNull(false)
  @Column(
    DataType.ENUM('owner', 'admin', 'product_manager', 'developer', 'designer', 'qa', 'viewer')
  )
  role!: string;

  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  invited_by!: string;

  @Default('pending')
  @Column(DataType.ENUM('pending', 'accepted', 'expired', 'cancelled'))
  status!: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.UUID)
  token!: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  expires_at!: Date;

  @BelongsTo(() => WorkspaceModel)
  workspace?: WorkspaceModel;

  @BelongsTo(() => UserModel)
  inviter?: UserModel;
}
