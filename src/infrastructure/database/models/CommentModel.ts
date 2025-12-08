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
  HasMany,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { WorkspaceModel } from './WorkspaceModel';
import { UserModel } from './UserModel';

@Table({ tableName: 'comments', timestamps: true })
export class CommentModel extends Model {
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
  entityType!: string; // 'feature', 'task', 'bug', 'release'

  @AllowNull(false)
  @Column(DataType.UUID)
  entityId!: string;

  @ForeignKey(() => CommentModel)
  @Column(DataType.UUID)
  parentId?: string;

  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  authorId!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  content!: string;

  @Default([])
  @Column(DataType.ARRAY(DataType.UUID))
  mentions!: string[];

  @Default([])
  @Column(DataType.JSONB)
  attachments!: any[];

  @Column(DataType.DATE)
  editedAt?: Date;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BelongsTo(() => WorkspaceModel, 'workspaceId')
  workspace!: WorkspaceModel;

  @BelongsTo(() => UserModel, 'authorId')
  author!: UserModel;

  @BelongsTo(() => CommentModel, 'parentId')
  parent?: CommentModel;

  @HasMany(() => CommentModel, 'parentId')
  replies!: CommentModel[];
}
