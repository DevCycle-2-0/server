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
import { SubscriptionModel } from './SubscriptionModel';

@Table({
  tableName: 'invoices',
  timestamps: true,
})
export class InvoiceModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => SubscriptionModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  subscription_id!: string;

  @AllowNull(false)
  @Column(DataType.DECIMAL(10, 2))
  amount!: number;

  @AllowNull(false)
  @Column(DataType.STRING(3))
  currency!: string; // USD, EUR, etc.

  @Default('draft')
  @Column(DataType.ENUM('draft', 'open', 'paid', 'void', 'uncollectible'))
  status!: string;

  @Column(DataType.DATE)
  paid_at?: Date;

  @Column(DataType.TEXT)
  invoice_url?: string;

  @Column(DataType.TEXT)
  invoice_pdf?: string;

  @Column(DataType.STRING)
  stripe_invoice_id?: string;

  @BelongsTo(() => SubscriptionModel)
  subscription?: SubscriptionModel;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}
