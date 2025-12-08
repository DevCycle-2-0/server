import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  BelongsTo,
  ForeignKey,
} from "sequelize-typescript";
import { Platform } from "@shared/types/common.types";

@Table({ tableName: "products", timestamps: true, underscored: true })
export class Product extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => Workspace)
  @Column({ type: DataType.UUID, allowNull: false })
  workspaceId!: string;

  @BelongsTo(() => Workspace)
  workspace!: Workspace;

  @Column({ type: DataType.STRING(100), allowNull: false })
  name!: string;

  @Column({ type: DataType.TEXT })
  description?: string;

  @Column({ type: DataType.ARRAY(DataType.STRING), allowNull: false })
  platforms!: Platform[];

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  ownerId!: string;

  @BelongsTo(() => User)
  owner!: User;

  @Column({ type: DataType.STRING(20), defaultValue: "active" })
  status!: string;

  @HasMany(() => Feature)
  features!: Feature[];

  @Column({ type: DataType.DATE, field: "created_at" })
  createdAt!: Date;

  @Column({ type: DataType.DATE, field: "updated_at" })
  updatedAt!: Date;
}

// ...existing imports...
import { Workspace } from "./Workspace.entity";
import { User } from "./User.entity";
import { Feature } from "./Feature.entity";
