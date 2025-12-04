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
import { UserModel } from './UserModel';

@Table({
  tableName: 'user_settings',
  timestamps: true,
})
export class UserSettingsModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Unique
  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  user_id!: string;

  @Default('system')
  @Column(DataType.ENUM('light', 'dark', 'system'))
  theme!: string;

  @Default('en')
  @Column(DataType.STRING(10))
  language!: string;

  @Default('UTC')
  @Column(DataType.STRING(50))
  timezone!: string;

  @Default('YYYY-MM-DD')
  @Column(DataType.STRING(20))
  date_format!: string;

  @Default({
    email: { enabled: true, digest: 'daily', mentions: true, assignments: true, updates: false },
    push: { enabled: true, mentions: true, assignments: true, updates: false },
  })
  @Column(DataType.JSONB)
  notifications!: object;

  @BelongsTo(() => UserModel)
  user?: UserModel;
}
