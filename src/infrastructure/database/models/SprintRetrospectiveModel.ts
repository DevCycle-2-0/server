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
  Unique,
} from 'sequelize-typescript';
import { SprintModel } from './SprintModel';

@Table({
  tableName: 'sprint_retrospectives',
  timestamps: true,
})
export class SprintRetrospectiveModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Unique
  @ForeignKey(() => SprintModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  sprint_id!: string;

  @Default([])
  @Column(DataType.ARRAY(DataType.TEXT))
  went_well!: string[];

  @Default([])
  @Column(DataType.ARRAY(DataType.TEXT))
  needs_improvement!: string[];

  @Default([])
  @Column(DataType.ARRAY(DataType.TEXT))
  action_items!: string[];

  @BelongsTo(() => SprintModel)
  sprint?: SprintModel;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}
