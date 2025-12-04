import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Unique,
  AllowNull,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { WorkspaceModel } from './WorkspaceModel';

@Table({
  tableName: 'users',
  timestamps: true,
})
export class UserModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare email: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare password_hash: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare name: string;

  @Column(DataType.TEXT)
  declare avatar: string | null;

  @ForeignKey(() => WorkspaceModel)
  @Column(DataType.UUID)
  declare workspace_id: string | null;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare email_verified: boolean;

  @Default(true)
  @Column(DataType.BOOLEAN)
  declare is_active: boolean;

  @Default(0)
  @Column(DataType.INTEGER)
  declare failed_login_attempts: number;

  @Column(DataType.DATE)
  declare locked_until: Date | null;

  @Column(DataType.DATE)
  declare last_login_at: Date | null;

  @BelongsTo(() => WorkspaceModel)
  declare workspace?: WorkspaceModel;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}
