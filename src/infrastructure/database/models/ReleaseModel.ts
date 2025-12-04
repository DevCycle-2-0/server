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

@Table({
  tableName: 'releases',
  timestamps: true,
})
export class ReleaseModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => WorkspaceModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  workspace_id!: string;

  @ForeignKey(() => ProductModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  product_id!: string;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  declare version: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  name!: string;

  @Column(DataType.TEXT)
  description?: string;

  @Default('planning')
  @Column(
    DataType.ENUM('planning', 'development', 'testing', 'staging', 'production', 'rolled_back')
  )
  status!: string;

  @Column(DataType.TEXT)
  release_notes?: string;

  @Column(DataType.DATE)
  target_date?: Date;

  @Column(DataType.DATE)
  release_date?: Date;

  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  created_by!: string;

  @BelongsTo(() => WorkspaceModel)
  workspace?: WorkspaceModel;

  @BelongsTo(() => ProductModel)
  product?: ProductModel;

  @BelongsTo(() => UserModel)
  creator?: UserModel;
}
