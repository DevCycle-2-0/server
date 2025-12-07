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
import { WorkspaceModel } from './WorkspaceModel';
import { ProductModel } from './ProductModel';
import { UserModel } from './UserModel';
import { SprintModel } from './SprintModel';

@Table({
  tableName: 'features',
  timestamps: true,
})
export class FeatureModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => WorkspaceModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare workspace_id: string;

  @ForeignKey(() => ProductModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare product_id: string;

  @AllowNull(false)
  @Column(DataType.STRING(500))
  declare title: string;

  @Column(DataType.TEXT)
  declare description: string | null;

  // ✅ ADDED - Business value
  @Column(DataType.TEXT)
  declare business_value: string | null;

  // ✅ ADDED - Target users
  @Column(DataType.TEXT)
  declare target_users: string | null;

  // ✅ ADDED - Requester
  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare requester_id: string;

  @Default('idea')
  @Column(
    DataType.ENUM(
      'idea',
      'review',
      'approved',
      'development',
      'testing',
      'release',
      'live',
      'rejected'
    )
  )
  declare status: string;

  @Default('medium')
  @Column(DataType.ENUM('low', 'medium', 'high', 'critical'))
  declare priority: string;

  @ForeignKey(() => UserModel)
  @Column(DataType.UUID)
  declare assignee_id: string | null;

  @ForeignKey(() => SprintModel)
  @Column(DataType.UUID)
  declare sprint_id: string | null;

  @Column(DataType.INTEGER)
  declare estimated_hours: number | null;

  @Column(DataType.INTEGER)
  declare actual_hours: number | null;

  @Default(0)
  @Column(DataType.INTEGER)
  declare votes: number;

  @Default([])
  @Column(DataType.ARRAY(DataType.UUID))
  declare voted_by: string[];

  @ForeignKey(() => UserModel)
  @Column(DataType.UUID)
  declare approved_by: string | null;

  @Column(DataType.DATE)
  declare approved_at: Date | null;

  @Column(DataType.TEXT)
  declare approval_comment: string | null;

  @ForeignKey(() => UserModel)
  @Column(DataType.UUID)
  declare rejected_by: string | null;

  @Column(DataType.DATE)
  declare rejected_at: Date | null;

  @Column(DataType.TEXT)
  declare rejection_reason: string | null;

  // ✅ ADDED - Attachments
  @Default([])
  @Column(DataType.ARRAY(DataType.TEXT))
  declare attachments: string[];

  // ✅ ADDED - Target version
  @Column(DataType.STRING(50))
  declare target_version: string | null;

  @Default([])
  @Column(DataType.ARRAY(DataType.TEXT))
  declare tags: string[];

  @Default({})
  @Column(DataType.JSONB)
  declare metadata: Record<string, any>;

  @Column(DataType.DATE)
  declare completed_at: Date | null;

  @BelongsTo(() => WorkspaceModel)
  declare workspace?: WorkspaceModel;

  @BelongsTo(() => ProductModel)
  declare product?: ProductModel;

  @BelongsTo(() => UserModel, 'assignee_id')
  declare assignee?: UserModel;

  @BelongsTo(() => UserModel, 'requester_id')
  declare requester?: UserModel; // ✅ ADDED

  @BelongsTo(() => UserModel, 'approved_by')
  declare approver?: UserModel;

  @BelongsTo(() => UserModel, 'rejected_by')
  declare rejector?: UserModel;

  @BelongsTo(() => SprintModel)
  declare sprint?: SprintModel;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}
