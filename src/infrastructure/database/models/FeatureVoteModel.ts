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
  Unique,
} from 'sequelize-typescript';
import { FeatureModel } from './FeatureModel';
import { UserModel } from './UserModel';

@Table({ tableName: 'feature_votes', timestamps: true, updatedAt: false })
export class FeatureVoteModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => FeatureModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  featureId!: string;

  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  userId!: string;

  @CreatedAt
  createdAt!: Date;

  @BelongsTo(() => FeatureModel, 'featureId')
  feature!: FeatureModel;

  @BelongsTo(() => UserModel, 'userId')
  user!: UserModel;
}
