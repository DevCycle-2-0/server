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
import { ProductModel } from './ProductModel';
import { FeatureModel } from './FeatureModel';

@Table({
  tableName: 'sprints',
  timestamps: true,
})
export class SprintModel extends Model {
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
  @Column(DataType.STRING(255))
  name!: string;

  @Column(DataType.TEXT)
  goal?: string;

  @Default('planning')
  @Column(DataType.ENUM('planning', 'active', 'completed', 'cancelled'))
  status!: string;

  @Default('2_weeks')
  @Column(DataType.ENUM('1_week', '2_weeks', '3_weeks', '4_weeks'))
  duration!: string;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  start_date!: Date;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  end_date!: Date;

  @Default(0)
  @Column(DataType.INTEGER)
  velocity!: number;

  @BelongsTo(() => WorkspaceModel)
  workspace?: WorkspaceModel;

  @BelongsTo(() => ProductModel)
  product?: ProductModel;

  @HasMany(() => FeatureModel)
  features?: FeatureModel[];
}
