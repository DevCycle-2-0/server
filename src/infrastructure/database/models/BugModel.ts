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
import { SprintModel } from './SprintModel';
import { UserModel } from './UserModel';

@Table({
  tableName: 'bugs',
  timestamps: true,
})
export class BugModel extends Model {
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

  @ForeignKey(() => SprintModel)
  @Column(DataType.UUID)
  sprint_id?: string;

  @AllowNull(false)
  @Column(DataType.STRING(500))
  title!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  description!: string;

  @Column(DataType.TEXT)
  steps_to_reproduce?: string;

  @Column(DataType.TEXT)
  expected_behavior?: string;

  @Column(DataType.TEXT)
  actual_behavior?: string;

  @Default('open')
  @Column(
    DataType.ENUM('open', 'investigating', 'in_progress', 'fixed', 'retest', 'closed', 'wontfix')
  )
  status!: string;

  @AllowNull(false)
  @Column(DataType.ENUM('minor', 'major', 'critical', 'blocker'))
  severity!: string;

  @Column(DataType.STRING(100))
  environment?: string;

  @Column(DataType.STRING(100))
  browser?: string;

  @Column(DataType.STRING(100))
  os?: string;

  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  reporter_id!: string;

  @ForeignKey(() => UserModel)
  @Column(DataType.UUID)
  assignee_id?: string;

  @Default([])
  @Column(DataType.ARRAY(DataType.TEXT))
  attachments!: string[];

  @Default([])
  @Column(DataType.ARRAY(DataType.TEXT))
  tags!: string[];

  @Default({})
  @Column(DataType.JSONB)
  metadata!: Record<string, any>;

  @Column(DataType.DATE)
  resolved_at?: Date;

  @BelongsTo(() => WorkspaceModel)
  workspace?: WorkspaceModel;

  @BelongsTo(() => ProductModel)
  product?: ProductModel;

  @BelongsTo(() => SprintModel)
  sprint?: SprintModel;

  @BelongsTo(() => UserModel, 'reporter_id')
  reporter?: UserModel;

  @BelongsTo(() => UserModel, 'assignee_id')
  assignee?: UserModel;
}
