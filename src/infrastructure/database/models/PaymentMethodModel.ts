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

@Table({
  tableName: 'payment_methods',
  timestamps: true,
})
export class PaymentMethodModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  user_id!: string;

  @AllowNull(false)
  @Column(DataType.ENUM('card'))
  type!: string;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  brand!: string; // 'visa', 'mastercard', 'amex', etc.

  @AllowNull(false)
  @Column(DataType.STRING(4))
  last4!: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  expiry_month!: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  expiry_year!: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_default!: boolean;

  @Column(DataType.STRING)
  stripe_payment_method_id?: string;

  @BelongsTo(() => UserModel)
  user?: UserModel;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}
