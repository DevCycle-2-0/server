// src/infrastructure/database/models/UserRoleModel.ts
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
} from 'sequelize-typescript';
import { UserModel } from './UserModel';
import { WorkspaceModel } from './WorkspaceModel';

@Table({
  tableName: 'user_roles',
  timestamps: true,
  updatedAt: false,
})
export class UserRoleModel extends Model {
  // ✅ FIX: Use 'declare' keyword instead of '!' to avoid shadowing
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare user_id: string;

  @ForeignKey(() => WorkspaceModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare workspace_id: string;

  @AllowNull(false)
  @Column(
    DataType.ENUM('owner', 'admin', 'product_manager', 'developer', 'designer', 'qa', 'viewer')
  )
  declare role: string;

  @BelongsTo(() => UserModel)
  declare user?: UserModel;

  @BelongsTo(() => WorkspaceModel)
  declare workspace?: WorkspaceModel;
}
