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
} from "sequelize-typescript";
import { TaskModel } from "./TaskModel";
import { UserModel } from "./UserModel";

@Table({ tableName: "time_logs", timestamps: true, updatedAt: false })
export class TimeLogModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => TaskModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  taskId!: string;

  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  userId!: string;

  @AllowNull(false)
  @Column(DataType.DECIMAL(5, 2))
  hours!: number;

  @Column(DataType.TEXT)
  description?: string;

  @Default(DataType.NOW)
  @Column(DataType.DATEONLY)
  loggedDate!: Date;

  @CreatedAt
  createdAt!: Date;

  @BelongsTo(() => TaskModel, "taskId")
  task!: TaskModel;

  @BelongsTo(() => UserModel, "userId")
  user!: UserModel;
}
