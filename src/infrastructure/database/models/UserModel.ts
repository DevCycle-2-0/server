import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  Unique,
  CreatedAt,
  UpdatedAt,
  HasMany,
} from "sequelize-typescript";
import { WorkspaceModel } from "./WorkspaceModel";

@Table({ tableName: "users", timestamps: true })
export class UserModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  email!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  fullName!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  passwordHash!: string;

  @Column(DataType.STRING)
  avatarUrl?: string;

  @Default("UTC")
  @Column(DataType.STRING)
  timezone!: string;

  @Default("en")
  @Column(DataType.STRING)
  locale!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  emailVerified!: boolean;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @HasMany(() => WorkspaceModel, "ownerId")
  ownedWorkspaces!: WorkspaceModel[];
}
