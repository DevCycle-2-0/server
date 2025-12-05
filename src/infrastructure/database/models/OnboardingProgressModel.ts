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

interface StepData {
  completed: boolean;
  completedAt: Date | null;
}

interface OnboardingSteps {
  create_product: StepData;
  add_feature: StepData;
  invite_team: StepData;
  setup_sprint: StepData;
  customize_workflow: StepData;
}

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
  @Column(DataType.DATE)
  completed_at?: Date;

  @Default({
    create_product: { completed: false, completedAt: null },
    add_feature: { completed: false, completedAt: null },
    invite_team: { completed: false, completedAt: null },
    setup_sprint: { completed: false, completedAt: null },
    customize_workflow: { completed: false, completedAt: null },
  })
  @Column(DataType.JSONB)
  steps!: OnboardingSteps;

  @BelongsTo(() => UserModel)
  user?: UserModel;
}
