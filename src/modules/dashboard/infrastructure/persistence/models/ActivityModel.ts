import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  CreatedAt,
  Index,
} from "sequelize-typescript";

@Table({
  tableName: "activities",
  timestamps: true,
  updatedAt: false,
})
export class ActivityModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  @Index
  workspaceId!: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  @Index
  userId!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  userName!: string;

  @Default("")
  @Column(DataType.STRING(500))
  userAvatar!: string;

  @AllowNull(false)
  @Column(DataType.ENUM("task", "bug", "feature", "sprint", "release"))
  @Index
  entityType!: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  @Index
  entityId!: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  entityTitle!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  action!: string;

  @Column(DataType.JSONB)
  metadata?: any;

  @CreatedAt
  @Column(DataType.DATE)
  @Index
  createdAt!: Date;
}
