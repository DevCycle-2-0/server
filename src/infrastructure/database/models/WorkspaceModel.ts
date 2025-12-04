import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Unique,
  AllowNull,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { UserModel } from './UserModel';
import { ProductModel } from './ProductModel';

@Table({
  tableName: 'workspaces',
  timestamps: true,
})
export class WorkspaceModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare name: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare slug: string;

  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare owner_id: string;

  @Default({
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    weekStartsOn: 1,
    defaultSprintDuration: 14,
  })
  @Column(DataType.JSONB)
  declare settings: {
    timezone: string;
    dateFormat: string;
    weekStartsOn: number;
    defaultSprintDuration: number;
  };

  @BelongsTo(() => UserModel)
  declare owner?: UserModel;

  @HasMany(() => ProductModel)
  declare products?: ProductModel[];

  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}
