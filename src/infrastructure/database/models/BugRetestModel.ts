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
import { BugModel } from './BugModel';
import { UserModel } from './UserModel';

@Table({
  tableName: 'bug_retests',
  timestamps: true,
  updatedAt: false, // Retest results are immutable
})
export class BugRetestModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => BugModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  bug_id!: string;

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  passed!: boolean;

  @Column(DataType.TEXT)
  notes?: string;

  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  tester_id!: string;

  @Default(DataType.NOW)
  @Column(DataType.DATE)
  tested_at!: Date;

  @BelongsTo(() => BugModel)
  bug?: BugModel;

  @BelongsTo(() => UserModel)
  tester?: UserModel;

  declare readonly created_at: Date;
}
