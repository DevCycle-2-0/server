import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  BelongsTo,
  ForeignKey,
} from "sequelize-typescript";

@Table({ tableName: "users", timestamps: true, underscored: true })
export class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @Column({ type: DataType.STRING(255), allowNull: false, unique: true })
  email!: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  passwordHash!: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  name!: string;

  @Column({ type: DataType.TEXT })
  avatar?: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  emailVerified!: boolean;

  @ForeignKey(() => Workspace)
  @Column({ type: DataType.UUID })
  workspaceId!: string;

  @BelongsTo(() => Workspace)
  workspace!: Workspace;

  @Column({ type: DataType.DATE, field: "created_at" })
  createdAt!: Date;

  @Column({ type: DataType.DATE, field: "updated_at" })
  updatedAt!: Date;
}

// ...existing imports...
import { Workspace } from "./Workspace.entity";
