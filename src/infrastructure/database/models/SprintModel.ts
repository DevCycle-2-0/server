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
  @Column(DataType.STRING(255))
  declare name: string;

  @Column(DataType.TEXT)
  declare goal: string | null;

  @Default('planning')
  @Column(DataType.ENUM('planning', 'active', 'completed', 'cancelled'))
  declare status: string;

  @Default('2_weeks')
  @Column(DataType.ENUM('1_week', '2_weeks', '3_weeks', '4_weeks'))
  declare duration: string;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  declare start_date: Date;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  declare end_date: Date;

  @Default(0)
  @Column(DataType.INTEGER)
  declare velocity: number;

  @BelongsTo(() => WorkspaceModel)
  declare workspace?: WorkspaceModel;

  @BelongsTo(() => ProductModel)
  declare product?: ProductModel;

  @HasMany(() => FeatureModel)
  declare features?: FeatureModel[];

  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}
