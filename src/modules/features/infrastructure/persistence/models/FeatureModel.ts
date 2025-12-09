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
  tableName: "features",
  timestamps: true,
})
export class FeatureModel extends Model {
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

  @Default("idea")
  @Column(
    DataType.ENUM(
      "idea",
      "review",
      "approved",
      "planning",
      "design",
      "development",
      "testing",
      "release",
      "live",
      "rejected"
    )
  )
  status!: string;

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

  @AllowNull(false)
  @Column(DataType.UUID)
  requestedBy!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  requestedByName!: string;

  @Column(DataType.UUID)
  assigneeId?: string;

  @Column(DataType.STRING(100))
  assigneeName?: string;

  @Column(DataType.UUID)
  sprintId?: string;

  @Column(DataType.STRING(100))
  sprintName?: string;

  @Default(0)
  @Column(DataType.INTEGER)
  votes!: number;

  @Default([])
  @Column(DataType.ARRAY(DataType.UUID))
  votedBy!: string[];

  @Column(DataType.INTEGER)
  estimatedHours?: number;

  @Column(DataType.INTEGER)
  actualHours?: number;

  @Column(DataType.DATE)
  dueDate?: Date;

  @Column(DataType.DATE)
  completedAt?: Date;

  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  tags!: string[];

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
