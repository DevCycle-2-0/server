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
import { TaskModel } from './TaskModel';
import { UserModel } from './UserModel';

@Table({
  tableName: 'time_logs',
  timestamps: true,
  updatedAt: false,
})
export class TimeLogModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => TaskModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  task_id!: string;

  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  user_id!: string;

  @AllowNull(false)
  @Column(DataType.DECIMAL(5, 2))
  hours!: number;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  date!: Date;

  @Column(DataType.TEXT)
  description?: string;

  @BelongsTo(() => TaskModel)
  task?: TaskModel;

  @BelongsTo(() => UserModel)
  user?: UserModel;
}
