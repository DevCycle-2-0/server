import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
  Index,
} from "sequelize-typescript";
import { UserModel } from "@modules/auth/infrastructure/persistence/models/UserModel";

@Table({
  tableName: "payment_methods",
  timestamps: true,
})
export class PaymentMethodModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  @Index
  userId!: string;

  @Default("card")
  @Column(DataType.ENUM("card"))
  type!: string;

  @AllowNull(false)
  @Column(DataType.STRING(4))
  last4!: string;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  brand!: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  expiryMonth!: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  expiryYear!: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isDefault!: boolean;

  @Column(DataType.STRING(255))
  stripePaymentMethodId?: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}
