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
} from "sequelize-typescript";
import { WorkspaceModel } from "./WorkspaceModel";
import { ProductModel } from "./ProductModel";
import { FeatureModel } from "./FeatureModel";
import { SprintModel } from "./SprintModel";
import { UserModel } from "./UserModel";
import { ItemStatus, PriorityLevel } from "@shared/types";

@Table({ tableName: "tasks", timestamps: true })
export class TaskModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => WorkspaceModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  workspaceId!: string;

  @ForeignKey(() => ProductModel)
  @Column(DataType.UUID)
  productId?: string;

  @ForeignKey(() => FeatureModel)
  @Column(DataType.UUID)
  featureId?: string;

  @ForeignKey(() => SprintModel)
  @Column(DataType.UUID)
  sprintId?: string;

  @ForeignKey(() => TaskModel)
  @Column(DataType.UUID)
  parentTaskId?: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  title!: string;

  @Column(DataType.TEXT)
  description?: string;

  @Default("task")
  @Column(DataType.STRING)
  type!: string;

  @Default(ItemStatus.TODO)
  @Column(DataType.ENUM(...Object.values(ItemStatus)))
  status!: ItemStatus;

  @Default(PriorityLevel.MEDIUM)
  @Column(DataType.ENUM(...Object.values(PriorityLevel)))
  priority!: PriorityLevel;

  @Column(DataType.INTEGER)
  storyPoints?: number;

  @Column(DataType.DECIMAL(5, 2))
  estimatedHours?: number;

  @Default(0)
  @Column(DataType.DECIMAL(5, 2))
  loggedHours!: number;

  @ForeignKey(() => UserModel)
  @Column(DataType.UUID)
  assigneeId?: string;

  @ForeignKey(() => UserModel)
  @Column(DataType.UUID)
  reporterId?: string;

  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  tags!: string[];

  @Column(DataType.DATE)
  dueDate?: Date;

  @Column(DataType.DATE)
  completedAt?: Date;

  @Default(0)
  @Column(DataType.INTEGER)
  position!: number;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BelongsTo(() => WorkspaceModel, "workspaceId")
  workspace!: WorkspaceModel;

  @BelongsTo(() => ProductModel, "productId")
  product?: ProductModel;

  @BelongsTo(() => FeatureModel, "featureId")
  feature?: FeatureModel;

  @BelongsTo(() => SprintModel, "sprintId")
  sprint?: SprintModel;

  @BelongsTo(() => UserModel, "assigneeId")
  assignee?: UserModel;

  @BelongsTo(() => UserModel, "reporterId")
  reporter?: UserModel;
}
