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
import { SubscriptionModel } from "./SubscriptionModel";

@Table({
  tableName: "invoices",
  timestamps: true,
})
export class InvoiceModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => SubscriptionModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  @Index
  subscriptionId!: string;

  @AllowNull(false)
  @Column(DataType.DECIMAL(10, 2))
  amount!: number;

  @Default("pending")
  @Column(DataType.ENUM("paid", "pending", "failed"))
  status!: string;

  @Column(DataType.STRING(500))
  invoiceUrl?: string;

  @Column(DataType.DATE)
  paidAt?: Date;

  @Column(DataType.STRING(255))
  stripeInvoiceId?: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}
