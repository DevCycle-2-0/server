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
import { SprintModel } from './SprintModel';
import { FeatureModel } from './FeatureModel';
import { UserModel } from './UserModel';

@Table({
  tableName: 'tasks',
  timestamps: true,
})
export class TaskModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => WorkspaceModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  workspace_id!: string;

  @ForeignKey(() => SprintModel)
  @Column(DataType.UUID)
  sprint_id?: string;

  @ForeignKey(() => FeatureModel)
  @Column(DataType.UUID)
  feature_id?: string;

  @AllowNull(false)
  @Column(DataType.STRING(500))
  title!: string;

  @Column(DataType.TEXT)
  description?: string;

  @Default('todo')
  @Column(DataType.ENUM('backlog', 'todo', 'in_progress', 'code_review', 'qa_testing', 'done'))
  status!: string;

  @Default('medium')
  @Column(DataType.ENUM('low', 'medium', 'high', 'critical'))
  priority!: string;

  @ForeignKey(() => UserModel)
  @Column(DataType.UUID)
  assignee_id?: string;

  @Column(DataType.INTEGER)
  estimated_hours?: number;

  @Column(DataType.INTEGER)
  actual_hours?: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_blocked!: boolean;

  @Column(DataType.TEXT)
  blocked_reason?: string;

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

  @BelongsTo(() => SprintModel)
  sprint?: SprintModel;

  @BelongsTo(() => FeatureModel)
  feature?: FeatureModel;

  @BelongsTo(() => UserModel)
  assignee?: UserModel;
}
