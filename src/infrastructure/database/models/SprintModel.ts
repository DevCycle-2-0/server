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
} from "sequelize-typescript";
import { WorkspaceModel } from "./WorkspaceModel";
import { ProductModel } from "./ProductModel";
import { UserModel } from "./UserModel";
import { FeatureModel } from "./FeatureModel";
import { TaskModel } from "./TaskModel";
import { SprintStatus } from "@shared/types";

@Table({ tableName: "sprints", timestamps: true })
export class SprintModel extends Model {
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

  @AllowNull(false)
  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.TEXT)
  goal?: string;

  @Default(SprintStatus.PLANNING)
  @Column(DataType.ENUM(...Object.values(SprintStatus)))
  status!: SprintStatus;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  startDate!: Date;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  endDate!: Date;

  @Column(DataType.INTEGER)
  capacityPoints?: number;

  @Default(0)
  @Column(DataType.INTEGER)
  completedPoints!: number;

  @Column(DataType.DECIMAL(5, 2))
  velocity?: number;

  @Column(DataType.JSONB)
  retrospective?: Record<string, any>;

  @ForeignKey(() => UserModel)
  @Column(DataType.UUID)
  createdBy?: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BelongsTo(() => WorkspaceModel, "workspaceId")
  workspace!: WorkspaceModel;

  @BelongsTo(() => ProductModel, "productId")
  product?: ProductModel;

  @BelongsTo(() => UserModel, "createdBy")
  creator?: UserModel;

  @HasMany(() => FeatureModel, "sprintId")
  features!: FeatureModel[];

  @HasMany(() => TaskModel, "sprintId")
  tasks!: TaskModel[];
}
