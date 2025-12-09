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

@Table({
  tableName: "products",
  timestamps: true,
})
export class ProductModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  name!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  description!: string;

  @AllowNull(false)
  @Column(DataType.ARRAY(DataType.STRING))
  platforms!: string[];

  @AllowNull(false)
  @Column(DataType.UUID)
  ownerId!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  ownerName!: string;

  @Default("active")
  @Column(DataType.ENUM("active", "archived"))
  status!: "active" | "archived";

  @Default(0)
  @Column(DataType.INTEGER)
  featuresCount!: number;

  @Default(0)
  @Column(DataType.INTEGER)
  bugsCount!: number;

  @Default(0)
  @Column(DataType.INTEGER)
  teamMembersCount!: number;

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
