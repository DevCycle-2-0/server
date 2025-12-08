import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
} from "sequelize-typescript";
import {
  Platform,
  Priority,
  BugStatus,
  BugSeverity,
} from "@shared/types/common.types";

@Table({ tableName: "bugs", timestamps: true, underscored: true })
export class Bug extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @Column({ type: DataType.STRING(200), allowNull: false })
  title!: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  description!: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  stepsToReproduce!: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  expectedBehavior!: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  actualBehavior!: string;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: "new" })
  status!: BugStatus;

  @Column({ type: DataType.STRING(20), allowNull: false })
  severity!: BugSeverity;

  @Column({ type: DataType.STRING(20), allowNull: false })
  priority!: Priority;

  @ForeignKey(() => Product)
  @Column({ type: DataType.UUID, allowNull: false })
  productId!: string;

  @BelongsTo(() => Product)
  product!: Product;

  @Column({ type: DataType.STRING(20), allowNull: false })
  platform!: Platform;

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
  @Column({ type: DataType.UUID, allowNull: false })
  reporterId!: string;

  @BelongsTo(() => User, "reporterId")
  reporter!: User;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  assigneeId?: string;

  @BelongsTo(() => User, "assigneeId")
  assignee?: User;

  @Column({ type: DataType.STRING(100), allowNull: false })
  environment!: string;

  @Column({ type: DataType.STRING(50) })
  version?: string;

  @Column({ type: DataType.STRING(255) })
  browserInfo?: string;

  @Column({ type: DataType.DATE })
  resolvedAt?: Date;

  @Column({ type: DataType.DATE, field: "created_at" })
  createdAt!: Date;

  @Column({ type: DataType.DATE, field: "updated_at" })
  updatedAt!: Date;
}

// ...existing imports...
import { Product } from "./Product.entity";
import { Feature } from "./Feature.entity";
import { Sprint } from "./Sprint.entity";
import { User } from "./User.entity";
