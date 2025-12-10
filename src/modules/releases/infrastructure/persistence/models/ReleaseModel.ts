// src/modules/releases/infrastructure/persistence/models/ReleaseModel.ts
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
  tableName: "releases",
  timestamps: true,
})
export class ReleaseModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  version!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  buildId!: string;

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

  @Default("planning")
  @Column(
    DataType.ENUM(
      "planning",
      "scheduled", // ← Add this
      "in_development",
      "testing",
      "staged",
      "released",
      "rolled_back"
    )
  )
  status!: string;

  @Column(DataType.DATE)
  releaseDate?: Date;

  @Column(DataType.DATE)
  plannedDate?: Date;

  @Default([])
  @Column(DataType.JSONB)
  features!: any[];

  @Default([])
  @Column(DataType.JSONB)
  bugFixes!: any[];

  @Default(0)
  @Column(DataType.DECIMAL(5, 2))
  testCoverage!: number;

  @Default([])
  @Column(DataType.JSONB)
  pipeline!: any[];

  @Default([])
  @Column(DataType.JSONB)
  rollbackLogs!: any[];

  @Default("")
  @Column(DataType.TEXT)
  releaseNotes!: string;

  @Column(DataType.ENUM("pending", "approved", "rejected"))
  approvalStatus?: string;

  @Default([])
  @Column(DataType.JSONB)
  approvers!: any[];

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
}
