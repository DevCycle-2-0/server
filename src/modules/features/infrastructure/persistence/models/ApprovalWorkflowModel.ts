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
  Index,
} from "sequelize-typescript";
import { WorkspaceModel } from "@modules/auth/infrastructure/persistence/models/WorkspaceModel";
import { FeatureModel } from "./FeatureModel";

@Table({
  tableName: "approval_workflows",
  timestamps: true,
})
export class ApprovalWorkflowModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => FeatureModel)
  @AllowNull(false)
  @Index
  @Column(DataType.UUID)
  featureId!: string;

  @Default("in_progress")
  @Column(DataType.ENUM("not_started", "in_progress", "completed", "rejected"))
  status!: string;

  @Default(0)
  @Column(DataType.INTEGER)
  currentGateIndex!: number;

  @AllowNull(false)
  @Column(DataType.JSONB)
  gates!: any[];

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
