import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  ForeignKey,
  Unique,
  CreatedAt,
  UpdatedAt,
  Index,
} from "sequelize-typescript";
import { UserModel } from "@modules/auth/infrastructure/persistence/models/UserModel";
import { WorkspaceModel } from "@modules/auth/infrastructure/persistence/models/WorkspaceModel";

@Table({
  tableName: "subscriptions",
  timestamps: true,
})
export class SubscriptionModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => UserModel)
  @Unique
  @AllowNull(false)
  @Column(DataType.UUID)
  @Index
  userId!: string;

  @ForeignKey(() => WorkspaceModel)
  @Unique
  @AllowNull(false)
  @Column(DataType.UUID)
  @Index
  workspaceId!: string;

  @AllowNull(false)
  @Column(DataType.ENUM("free", "pro", "team", "enterprise"))
  planId!: string;

  @Default("active")
  @Column(DataType.ENUM("active", "cancelled", "expired", "trial"))
  status!: string;

  @AllowNull(false)
  @Column(DataType.ENUM("monthly", "yearly"))
  interval!: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  currentPeriodStart!: Date;

  @AllowNull(false)
  @Column(DataType.DATE)
  currentPeriodEnd!: Date;

  @Default(false)
  @Column(DataType.BOOLEAN)
  cancelAtPeriodEnd!: boolean;

  @Column(DataType.DATE)
  trialEndsAt?: Date;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}
