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
  HasMany,
} from 'sequelize-typescript';
import { WorkspaceModel } from './WorkspaceModel';
import { FeatureModel } from './FeatureModel';
import { SprintModel } from './SprintModel';

@Table({
  tableName: 'products',
  timestamps: true,
})
export class ProductModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => WorkspaceModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  workspace_id!: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  name!: string;

  @Column(DataType.TEXT)
  description?: string;

  @AllowNull(false)
  @Column(DataType.ENUM('android', 'ios', 'web', 'dashboard', 'backend', 'api'))
  platform!: string;

  @Column(DataType.STRING(50))
  version?: string;

  @Default('active')
  @Column(DataType.ENUM('active', 'maintenance', 'deprecated', 'archived'))
  status!: string;

  @Column(DataType.TEXT)
  icon?: string;

  @Default({})
  @Column(DataType.JSONB)
  settings!: Record<string, any>;

  @BelongsTo(() => WorkspaceModel)
  workspace?: WorkspaceModel;

  @HasMany(() => FeatureModel)
  features?: FeatureModel[];

  @HasMany(() => SprintModel)
  sprints?: SprintModel[];
}
