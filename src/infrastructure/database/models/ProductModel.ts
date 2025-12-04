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
  declare id: string;

  @ForeignKey(() => WorkspaceModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare workspace_id: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare name: string;

  @Column(DataType.TEXT)
  declare description: string | null;

  @AllowNull(false)
  @Column(DataType.ENUM('android', 'ios', 'web', 'dashboard', 'backend', 'api'))
  declare platform: string;

  @Column(DataType.STRING(50))
  declare version: string | null;

  @Default('active')
  @Column(DataType.ENUM('active', 'maintenance', 'deprecated', 'archived'))
  declare status: string;

  @Column(DataType.TEXT)
  declare icon: string | null;

  @Default({})
  @Column(DataType.JSONB)
  declare settings: Record<string, any>;

  @BelongsTo(() => WorkspaceModel)
  declare workspace?: WorkspaceModel;

  @HasMany(() => FeatureModel)
  declare features?: FeatureModel[];

  @HasMany(() => SprintModel)
  declare sprints?: SprintModel[];

  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}
