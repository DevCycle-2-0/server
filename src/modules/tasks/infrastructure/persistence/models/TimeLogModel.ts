import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";

@Table({
  tableName: "time_logs",
  timestamps: true,
  updatedAt: false,
})
export class TimeLogModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  taskId!: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  userId!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  userName!: string;

  @AllowNull(false)
  @Column(DataType.DECIMAL(5, 2))
  hours!: number;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  date!: Date;

  @Column(DataType.STRING(500))
  description?: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;
}
