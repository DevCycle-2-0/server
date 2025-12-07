import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { UserModel } from './UserModel';
import { WorkspaceModel } from './WorkspaceModel';

@Table({
  tableName: 'subscriptions',
  timestamps: true,
})
export class SubscriptionModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  user_id!: string;

  @ForeignKey(() => WorkspaceModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  workspace_id!: string;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  plan_id!: string; // 'free', 'pro', 'team', 'enterprise'

  @Default('active')
  @Column(DataType.ENUM('active', 'canceled', 'past_due', 'trialing', 'incomplete'))
  status!: string;

  @AllowNull(false)
  @Column(DataType.ENUM('monthly', 'yearly'))
  interval!: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  current_period_start!: Date;

  @AllowNull(false)
  @Column(DataType.DATE)
  current_period_end!: Date;

  @Default(false)
  @Column(DataType.BOOLEAN)
  cancel_at_period_end!: boolean;

  @Column(DataType.DATE)
  trial_ends_at?: Date;

  @Column(DataType.STRING)
  stripe_subscription_id?: string;

  @Column(DataType.STRING)
  stripe_customer_id?: string;

  @BelongsTo(() => UserModel)
  user?: UserModel;

  @BelongsTo(() => WorkspaceModel)
  workspace?: WorkspaceModel;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}
