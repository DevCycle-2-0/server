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
import { ProductModel } from './ProductModel';
import { SprintModel } from './SprintModel';
import { UserModel } from './UserModel';
import { TaskModel } from './';
import { FeatureStage, PriorityLevel, ItemStatus } from '@shared/types';

@Table({ tableName: 'features', timestamps: true })
export class FeatureModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  a;
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => WorkspaceModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  workspaceId!: string;

  @ForeignKey(() => ProductModel)
  @Column(DataType.UUID)
  productId?: string;

  @ForeignKey(() => SprintModel)
  @Column(DataType.UUID)
  sprintId?: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  title!: string;

  @Column(DataType.TEXT)
  description?: string;

  @Default(FeatureStage.IDEA)
  @Column(DataType.ENUM(...Object.values(FeatureStage)))
  stage!: FeatureStage;

  @Default(PriorityLevel.MEDIUM)
  @Column(DataType.ENUM(...Object.values(PriorityLevel)))
  priority!: PriorityLevel;

  @Default(ItemStatus.BACKLOG)
  @Column(DataType.ENUM(...Object.values(ItemStatus)))
  status!: ItemStatus;

  @Default(0)
  @Column(DataType.INTEGER)
  votes!: number;

  @Column(DataType.INTEGER)
  storyPoints?: number;

  @Column(DataType.UUID)
  targetReleaseId?: string;

  @ForeignKey(() => UserModel)
  @Column(DataType.UUID)
  assigneeId?: string;

  @ForeignKey(() => UserModel)
  @Column(DataType.UUID)
  reporterId?: string;

  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  tags!: string[];

  @Default([])
  @Column(DataType.JSONB)
  attachments!: any[];

  @Default({})
  @Column(DataType.JSONB)
  customFields!: Record<string, any>;

  @Column(DataType.DATE)
  dueDate?: Date;

  @Column(DataType.DATE)
  completedAt?: Date;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BelongsTo(() => WorkspaceModel, 'workspaceId')
  workspace!: WorkspaceModel;

  @BelongsTo(() => ProductModel, 'productId')
  product?: ProductModel;

  @BelongsTo(() => SprintModel, 'sprintId')
  sprint?: SprintModel;

  @BelongsTo(() => UserModel, 'assigneeId')
  assignee?: UserModel;

  @BelongsTo(() => UserModel, 'reporterId')
  reporter?: UserModel;

  @HasMany(() => TaskModel, 'featureId')
  tasks!: TaskModel[];
}
