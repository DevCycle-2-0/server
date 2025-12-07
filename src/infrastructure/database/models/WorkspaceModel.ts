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
  BelongsTo,
  HasMany,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import { UserModel } from "./UserModel";
import { ProductModel } from "./ProductModel";
import { SubscriptionPlan } from "@shared/types";

@Table({ tableName: "workspaces", timestamps: true })
export class WorkspaceModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  name!: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  slug!: string;

  @Column(DataType.STRING)
  logoUrl?: string;

  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  ownerId!: string;

  @Default(SubscriptionPlan.FREE)
  @Column(DataType.ENUM(...Object.values(SubscriptionPlan)))
  subscriptionPlan!: SubscriptionPlan;

  @Default("active")
  @Column(DataType.STRING)
  subscriptionStatus!: string;

  @Column(DataType.STRING)
  stripeCustomerId?: string;

  @Column(DataType.STRING)
  stripeSubscriptionId?: string;

  @Default({})
  @Column(DataType.JSONB)
  settings!: Record<string, any>;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BelongsTo(() => UserModel, "ownerId")
  owner!: UserModel;

  @HasMany(() => ProductModel, "workspaceId")
  products!: ProductModel[];
}
