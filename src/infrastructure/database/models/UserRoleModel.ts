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
import { UserModel } from './UserModel';
import { WorkspaceModel } from './WorkspaceModel';

@Table({
  tableName: 'user_roles',
  timestamps: true,
  updatedAt: false,
})
export class UserRoleModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  user_id!: string;

  @ForeignKey(() => WorkspaceModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  workspace_id!: string;

  @AllowNull(false)
  @Column(
    DataType.ENUM('owner', 'admin', 'product_manager', 'developer', 'designer', 'qa', 'viewer')
  )
  role!: string;

  @BelongsTo(() => UserModel)
  user?: UserModel;

  @BelongsTo(() => WorkspaceModel)
  workspace?: WorkspaceModel;
}
