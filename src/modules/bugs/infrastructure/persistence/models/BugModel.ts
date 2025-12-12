// src/modules/bugs/infrastructure/persistence/models/BugModel.ts
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import { WorkspaceModel } from "@modules/auth/infrastructure/persistence/models/WorkspaceModel";
import { ProductModel } from "@modules/products/infrastructure/persistence/models/ProductModel";

@Table({
  tableName: "bugs",
  timestamps: true,
})
export class BugModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column(DataType.STRING(200))
  title!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  description!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  stepsToReproduce!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  expectedBehavior!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  actualBehavior!: string;

  @Default("new")
  @Column(
    DataType.ENUM(
      "new",
      "confirmed",
      "in_progress",
      "fixed",
      "verified",
      "closed",
      "reopened",
      "wont_fix",
      "duplicate"
    )
  )
  status!: string;

  // FIXED: Changed enum values to match BugSeverity type
  @AllowNull(false)
  @Column(DataType.ENUM("low", "medium", "high", "critical"))
  severity!: string;

  // FIXED: Priority uses the same values as severity
  @AllowNull(false)
  @Column(DataType.ENUM("low", "medium", "high", "critical"))
  priority!: string;

  @ForeignKey(() => ProductModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  productId!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  productName!: string;

  @AllowNull(false)
  @Column(DataType.ENUM("web", "android", "ios", "api", "desktop"))
  platform!: string;

  @Column(DataType.UUID)
  featureId?: string;

  @Column(DataType.STRING(200))
  featureTitle?: string;

  @Column(DataType.UUID)
  sprintId?: string;

  @Column(DataType.STRING(100))
  sprintName?: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  reporterId!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  reporterName!: string;

  @Column(DataType.UUID)
  assigneeId?: string;

  @Column(DataType.STRING(100))
  assigneeName?: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  environment!: string;

  @Column(DataType.STRING(50))
  version?: string;

  @Column(DataType.STRING(200))
  browserInfo?: string;

  @Default([])
  @Column(DataType.JSONB)
  retestResults!: any[];

  @Column(DataType.UUID)
  duplicateOf?: string;

  @ForeignKey(() => WorkspaceModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  workspaceId!: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;

  @Column(DataType.DATE)
  resolvedAt?: Date;
}
