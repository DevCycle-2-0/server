import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  Unique,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
  Index,
} from "sequelize-typescript";
import { WorkspaceModel } from "@modules/auth/infrastructure/persistence/models/WorkspaceModel";

@Table({
  tableName: "team_members",
  timestamps: true,
})
export class TeamMemberModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  @Index
  userId!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  name!: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  @Index
  email!: string;

  @Column(DataType.STRING(500))
  avatar?: string;

  @AllowNull(false)
  @Column(
    DataType.ENUM(
      "business_owner",
      "product_owner",
      "technical_leader",
      "ui_ux_designer",
      "frontend_dev",
      "backend_dev",
      "mobile_android",
      "mobile_ios",
      "qa_tester",
      "project_manager"
    )
  )
  role!: string;

  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  permissions!: string[];

  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  skills!: string[];

  @Default([])
  @Column(DataType.JSONB)
  workload!: any[];

  @Default([])
  @Column(DataType.JSONB)
  availability!: any[];

  @Default([])
  @Column(DataType.JSONB)
  timeOffRequests!: any[];

  @Default("invited")
  @Column(DataType.ENUM("active", "invited", "inactive"))
  status!: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  joinedAt!: Date;

  @AllowNull(false)
  @Column(DataType.DATE)
  lastActive!: Date;

  @ForeignKey(() => WorkspaceModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  @Index
  workspaceId!: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}
