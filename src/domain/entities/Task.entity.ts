import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
} from "sequelize-typescript";
import { TaskStatus, TaskType, Priority } from "@shared/types/common.types";

@Table({ tableName: "tasks", timestamps: true, underscored: true })
export class Task extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @Column({ type: DataType.STRING(200), allowNull: false })
  title!: string;

  @Column({ type: DataType.TEXT })
  description?: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    defaultValue: "backlog",
  })
  status!: TaskStatus;

  @Column({ type: DataType.STRING(20), allowNull: false })
  type!: TaskType;

  @Column({ type: DataType.STRING(20), allowNull: false })
  priority!: Priority;

  @ForeignKey(() => Feature)
  @Column({ type: DataType.UUID })
  featureId?: string;

  @BelongsTo(() => Feature)
  feature?: Feature;

  @ForeignKey(() => Sprint)
  @Column({ type: DataType.UUID })
  sprintId?: string;

  @BelongsTo(() => Sprint)
  sprint?: Sprint;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  assigneeId?: string;

  @BelongsTo(() => User)
  assignee?: User;

  @Column({ type: DataType.INTEGER })
  estimatedHours?: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  loggedHours!: number;

  @Column({ type: DataType.DATE })
  dueDate?: Date;

  @Column({ type: DataType.DATE })
  completedAt?: Date;

  @Column({ type: DataType.ARRAY(DataType.STRING) })
  labels?: string[];

  @Column({ type: DataType.DATE, field: "created_at" })
  createdAt!: Date;

  @Column({ type: DataType.DATE, field: "updated_at" })
  updatedAt!: Date;
}

// ...existing imports...
import { Feature } from "./Feature.entity";
import { Sprint } from "./Sprint.entity";
import { User } from "./User.entity";
