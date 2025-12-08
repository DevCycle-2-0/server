import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  BelongsTo,
  ForeignKey,
} from "sequelize-typescript";
import { SprintStatus } from "@shared/types/common.types";

@Table({ tableName: "sprints", timestamps: true, underscored: true })
export class Sprint extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  name!: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  goal!: string;

  @ForeignKey(() => Product)
  @Column({ type: DataType.UUID, allowNull: false })
  productId!: string;

  @BelongsTo(() => Product)
  product!: Product;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    defaultValue: "planning",
  })
  status!: SprintStatus;

  @Column({ type: DataType.DATE, allowNull: false })
  startDate!: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  endDate!: Date;

  @Column({ type: DataType.INTEGER, allowNull: false })
  capacity!: number;

  @Column({ type: DataType.INTEGER })
  velocity?: number;

  @HasMany(() => Task)
  tasks!: Task[];

  @HasMany(() => Bug)
  bugs!: Bug[];

  @Column({ type: DataType.DATE, field: "created_at" })
  createdAt!: Date;

  @Column({ type: DataType.DATE, field: "updated_at" })
  updatedAt!: Date;
}

// ...existing imports...
import { Product } from "./Product.entity";
import { Task } from "./Task.entity";
import { Bug } from "./Bug.entity";
