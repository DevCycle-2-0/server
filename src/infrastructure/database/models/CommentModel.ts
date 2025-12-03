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
import { WorkspaceModel } from './WorkspaceModel';
import { UserModel } from './UserModel';

@Table({
  tableName: 'comments',
  timestamps: true,
})
export class CommentModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => WorkspaceModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  workspace_id!: string;

  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  author_id!: string;

  @AllowNull(false)
  @Column(DataType.ENUM('feature', 'task', 'bug'))
  entity_type!: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  entity_id!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  content!: string;

  @Column(DataType.UUID)
  parent_id?: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_edited!: boolean;

  @Column(DataType.DATE)
  edited_at?: Date;

  @BelongsTo(() => WorkspaceModel)
  workspace?: WorkspaceModel;

  @BelongsTo(() => UserModel)
  author?: UserModel;
}
