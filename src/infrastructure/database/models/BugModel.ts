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
import { BugSeverity, PriorityLevel, ItemStatus } from "@shared/types";

@Table({ tableName: "bugs", timestamps: true })
export class BugModel extends Model {
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

  @AllowNull(false)
  @Column(DataType.STRING)
  title!: string;

  @Column(DataType.TEXT)
  description?: string;

  @Column(DataType.TEXT)
  stepsToReproduce?: string;

  @Column(DataType.TEXT)
  expectedBehavior?: string;

  @Column(DataType.TEXT)
  actualBehavior?: string;

  @Column(DataType.JSONB)
  environment?: Record<string, any>;

  @Default(BugSeverity.MINOR)
  @Column(DataType.ENUM(...Object.values(BugSeverity)))
  severity!: BugSeverity;

  @Default(PriorityLevel.MEDIUM)
  @Column(DataType.ENUM(...Object.values(PriorityLevel)))
  priority!: PriorityLevel;

  @Default(ItemStatus.TODO)
  @Column(DataType.ENUM(...Object.values(ItemStatus)))
  status!: ItemStatus;

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

  @Column(DataType.TEXT)
  resolution?: string;

  @Column(DataType.DATE)
  resolvedAt?: Date;

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
