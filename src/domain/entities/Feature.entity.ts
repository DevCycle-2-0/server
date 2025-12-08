import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  BelongsTo,
  ForeignKey,
} from "sequelize-typescript";
import { Platform, Priority, FeatureStatus } from "@shared/types/common.types";

@Table({ tableName: "features", timestamps: true, underscored: true })
export class Feature extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => Product)
  @Column({ type: DataType.UUID, allowNull: false })
  productId!: string;

  @BelongsTo(() => Product)
  product!: Product;

  @ForeignKey(() => Sprint)
  @Column({ type: DataType.UUID })
  sprintId?: string;

  @BelongsTo(() => Sprint)
  sprint?: Sprint;

  @Column({ type: DataType.STRING(200), allowNull: false })
  title!: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  description!: string;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: "idea" })
  status!: FeatureStatus;

  @Column({ type: DataType.STRING(20), allowNull: false })
  priority!: Priority;

  @Column({ type: DataType.STRING(20), allowNull: false })
  platform!: Platform;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  requestedBy!: string;

  @BelongsTo(() => User, "requestedBy")
  requester!: User;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  assigneeId?: string;

  @BelongsTo(() => User, "assigneeId")
  assignee?: User;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  votes!: number;

  @Column({ type: DataType.ARRAY(DataType.UUID) })
  votedBy?: string[];

  @Column({ type: DataType.INTEGER })
  estimatedHours?: number;

  @Column({ type: DataType.INTEGER })
  actualHours?: number;

  @Column({ type: DataType.DATE })
  dueDate?: Date;

  @Column({ type: DataType.DATE })
  completedAt?: Date;

  @Column({ type: DataType.ARRAY(DataType.STRING) })
  tags?: string[];

  @HasMany(() => Task)
  tasks!: Task[];

  @Column({ type: DataType.DATE, field: "created_at" })
  createdAt!: Date;

  @Column({ type: DataType.DATE, field: "updated_at" })
  updatedAt!: Date;
}

// ...existing imports...
import { Product } from "./Product.entity";
import { Sprint } from "./Sprint.entity";
import { User } from "./User.entity";
import { Task } from "./Task.entity";
