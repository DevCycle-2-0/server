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
  tableName: "sprints",
  timestamps: true,
})
export class SprintModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  name!: string;

  @AllowNull(false)
  @Column(DataType.STRING(500))
  goal!: string;

  @ForeignKey(() => ProductModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  productId!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  productName!: string;

  @Default("planning")
  @Column(DataType.ENUM("planning", "active", "completed", "cancelled"))
  status!: string;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  startDate!: Date;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  endDate!: Date;

  @Default([])
  @Column(DataType.ARRAY(DataType.UUID))
  taskIds!: string[];

  @Default([])
  @Column(DataType.ARRAY(DataType.UUID))
  bugIds!: string[];

  @AllowNull(false)
  @Column(DataType.DECIMAL(10, 2))
  capacity!: number;

  @Column(DataType.DECIMAL(10, 2))
  velocity?: number;

  @Column(DataType.JSONB)
  retrospective?: any;

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
