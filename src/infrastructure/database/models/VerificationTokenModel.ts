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
  tableName: 'verification_tokens',
  timestamps: true,
  updatedAt: false,
})
export class VerificationTokenModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  user_id!: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.UUID)
  token!: string;

  @AllowNull(false)
  @Column(DataType.ENUM('email_verification', 'password_reset'))
  type!: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  expires_at!: Date;

  @Default(false)
  @Column(DataType.BOOLEAN)
  used!: boolean;

  @BelongsTo(() => UserModel)
  user?: UserModel;
}
