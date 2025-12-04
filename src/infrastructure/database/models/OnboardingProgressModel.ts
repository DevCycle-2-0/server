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
  tableName: 'onboarding_progress',
  timestamps: true,
})
export class OnboardingProgressModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Unique
  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  user_id!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_complete!: boolean;

  @Default(1)
  @Column(DataType.INTEGER)
  current_step!: number;

  @Default({
    create_product: false,
    add_feature: false,
    invite_team: false,
    setup_sprint: false,
    customize_workflow: false,
  })
  @Column(DataType.JSONB)
  steps!: object;

  @Column(DataType.DATE)
  completed_at?: Date;

  @BelongsTo(() => UserModel)
  user?: UserModel;
}
