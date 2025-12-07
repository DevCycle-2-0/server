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

// ✅ UPDATED: Interface now matches documentation step names
interface OnboardingSteps {
  workspace_setup: StepData;
  invite_team: StepData;
  create_product: StepData;
  add_feature: StepData;
  complete_setup: StepData;
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

  @Column(DataType.DATE)
  completed_at?: Date;

  // ✅ UPDATED: Default step names now match documentation
  @Default({
    workspace_setup: { completed: false, completedAt: null },
    invite_team: { completed: false, completedAt: null },
    create_product: { completed: false, completedAt: null },
    add_feature: { completed: false, completedAt: null },
    complete_setup: { completed: false, completedAt: null },
  })
  @Column(DataType.JSONB)
  steps!: OnboardingSteps;

  @BelongsTo(() => UserModel)
  user?: UserModel;
}
