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
import { UserModel } from "./UserModel";
import { ReleaseStatus } from "@shared/types";

@Table({ tableName: "releases", timestamps: true })
export class ReleaseModel extends Model {
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
  version!: string;

  @Column(DataType.STRING)
  name?: string;

  @Column(DataType.TEXT)
  description?: string;

  @Column(DataType.TEXT)
  releaseNotes?: string;

  @Default(ReleaseStatus.DRAFT)
  @Column(DataType.ENUM(...Object.values(ReleaseStatus)))
  status!: ReleaseStatus;

  @Default("minor")
  @Column(DataType.STRING)
  releaseType!: string;

  @Column(DataType.DATE)
  targetDate?: Date;

  @Column(DataType.DATE)
  releasedAt?: Date;

  @ForeignKey(() => UserModel)
  @Column(DataType.UUID)
  releasedBy?: string;

  @Column(DataType.TEXT)
  rollbackReason?: string;

  @Column(DataType.DATE)
  rolledBackAt?: Date;

  @Default({})
  @Column(DataType.JSONB)
  pipelineConfig!: Record<string, any>;

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

  @BelongsTo(() => UserModel, "releasedBy")
  releaser?: UserModel;
}
