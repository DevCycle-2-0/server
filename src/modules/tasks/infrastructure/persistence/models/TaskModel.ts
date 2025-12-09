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
  tableName: "tasks",
  timestamps: true,
})
export class TaskModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column(DataType.STRING(200))
  title!: string;

  @Default("")
  @Column(DataType.TEXT)
  description!: string;

  @Default("backlog")
  @Column(
    DataType.ENUM(
      "backlog",
      "todo",
      "in_progress",
      "in_review",
      "testing",
      "done",
      "blocked"
    )
  )
  status!: string;

  @AllowNull(false)
  @Column(
    DataType.ENUM(
      "frontend",
      "backend",
      "mobile_android",
      "mobile_ios",
      "api",
      "design",
      "qa",
      "devops",
      "documentation",
      "other"
    )
  )
  type!: string;

  @AllowNull(false)
  @Column(DataType.ENUM("low", "medium", "high", "critical"))
  priority!: string;

  @Column(DataType.UUID)
  featureId?: string;

  @Column(DataType.STRING(200))
  featureTitle?: string;

  @Column(DataType.UUID)
  sprintId?: string;

  @Column(DataType.STRING(100))
  sprintName?: string;

  @Column(DataType.UUID)
  assigneeId?: string;

  @Column(DataType.STRING(100))
  assigneeName?: string;

  @Column(DataType.STRING(500))
  assigneeAvatar?: string;

  @Column(DataType.DECIMAL(10, 2))
  estimatedHours?: number;

  @Default(0)
  @Column(DataType.DECIMAL(10, 2))
  loggedHours!: number;

  @Column(DataType.DATE)
  dueDate?: Date;

  @Column(DataType.DATE)
  completedAt?: Date;

  @Default([])
  @Column(DataType.JSONB)
  subtasks!: any[];

  @Default([])
  @Column(DataType.JSONB)
  dependencies!: any[];

  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  labels!: string[];

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
