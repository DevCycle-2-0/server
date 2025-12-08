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
  CreatedAt,
} from 'sequelize-typescript';
import { ReleaseModel } from './ReleaseModel';
import { FeatureModel } from './FeatureModel';

@Table({ tableName: 'release_features', timestamps: true, updatedAt: false })
export class ReleaseFeatureModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => ReleaseModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  releaseId!: string;

  @ForeignKey(() => FeatureModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  featureId!: string;

  @CreatedAt
  createdAt!: Date;

  @BelongsTo(() => ReleaseModel, 'releaseId')
  release!: ReleaseModel;

  @BelongsTo(() => FeatureModel, 'featureId')
  feature!: FeatureModel;
}
