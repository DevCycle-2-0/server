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
import { UserModel } from "./UserModel";
import { FeatureModel } from "./FeatureModel";
import { SprintModel } from "./SprintModel";

@Table({ tableName: "products", timestamps: true })
export class ProductModel extends Model {
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
  name!: string;

  @Column(DataType.TEXT)
  description?: string;

  @Column(DataType.STRING)
  logoUrl?: string;

  @Default("#6366F1")
  @Column(DataType.STRING)
  color!: string;

  @Default("active")
  @Column(DataType.STRING)
  status!: string;

  @Default({})
  @Column(DataType.JSONB)
  settings!: Record<string, any>;

  @ForeignKey(() => UserModel)
  @Column(DataType.UUID)
  createdBy?: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BelongsTo(() => WorkspaceModel, "workspaceId")
  workspace!: WorkspaceModel;

  @BelongsTo(() => UserModel, "createdBy")
  creator?: UserModel;

  @HasMany(() => FeatureModel, "productId")
  features!: FeatureModel[];

  @HasMany(() => SprintModel, "productId")
  sprints!: SprintModel[];
}
