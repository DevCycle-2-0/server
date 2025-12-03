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
  id!: string;

  @ForeignKey(() => WorkspaceModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  workspace_id!: string;

  @ForeignKey(() => ProductModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  product_id!: string;

  @AllowNull(false)
  @Column(DataType.STRING(500))
  title!: string;

  @Column(DataType.TEXT)
  description?: string;

  @Default('idea')
  @Column(DataType.ENUM('idea', 'review', 'approved', 'development', 'testing', 'release', 'live'))
  status!: string;

  @Default('medium')
  @Column(DataType.ENUM('low', 'medium', 'high', 'critical'))
  priority!: string;

  @ForeignKey(() => UserModel)
  @Column(DataType.UUID)
  assignee_id?: string;

  @ForeignKey(() => SprintModel)
  @Column(DataType.UUID)
  sprint_id?: string;

  @Column(DataType.INTEGER)
  estimated_hours?: number;

  @Column(DataType.INTEGER)
  actual_hours?: number;

  @Default(0)
  @Column(DataType.INTEGER)
  votes!: number;

  @Default([])
  @Column(DataType.ARRAY(DataType.TEXT))
  tags!: string[];

  @Default({})
  @Column(DataType.JSONB)
  metadata!: Record<string, any>;

  @Column(DataType.DATE)
  completed_at?: Date;

  @BelongsTo(() => WorkspaceModel)
  workspace?: WorkspaceModel;

  @BelongsTo(() => ProductModel)
  product?: ProductModel;

  @BelongsTo(() => UserModel)
  assignee?: UserModel;

  @BelongsTo(() => SprintModel)
  sprint?: SprintModel;
}
