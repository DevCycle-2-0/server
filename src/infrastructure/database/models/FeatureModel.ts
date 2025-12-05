// src/infrastructure/database/models/FeatureModel.ts
// Enhanced with vote tracking and approval/rejection fields

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
import { WorkspaceModel } from './WorkspaceModel';
import { ProductModel } from './ProductModel';
import { UserModel } from './UserModel';
import { SprintModel } from './SprintModel';

@Table({
  tableName: 'features',
  timestamps: true,
})
export class FeatureModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => WorkspaceModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare workspace_id: string;

  @ForeignKey(() => ProductModel)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare product_id: string;

  @AllowNull(false)
  @Column(DataType.STRING(500))
  declare title: string;

  @Column(DataType.TEXT)
  declare description: string | null;

  @Default('idea')
  @Column(
    DataType.ENUM(
      'idea',
      'review',
      'approved',
      'development',
      'testing',
      'release',
      'live',
      'rejected'
    )
  )
  declare status: string;

  @Default('medium')
  @Column(DataType.ENUM('low', 'medium', 'high', 'critical'))
  declare priority: string;

  @ForeignKey(() => UserModel)
  @Column(DataType.UUID)
  declare assignee_id: string | null;

  @ForeignKey(() => SprintModel)
  @Column(DataType.UUID)
  declare sprint_id: string | null;

  @Column(DataType.INTEGER)
  declare estimated_hours: number | null;

  @Column(DataType.INTEGER)
  declare actual_hours: number | null;

  @Default(0)
  @Column(DataType.INTEGER)
  declare votes: number;

  @Default([])
  @Column(DataType.ARRAY(DataType.UUID))
  declare voted_by: string[]; // NEW: Track who voted

  @ForeignKey(() => UserModel)
  @Column(DataType.UUID)
  declare approved_by: string | null; // NEW: Who approved

  @Column(DataType.DATE)
  declare approved_at: Date | null; // NEW: When approved

  @Column(DataType.TEXT)
  declare approval_comment: string | null; // NEW: Approval comment

  @ForeignKey(() => UserModel)
  @Column(DataType.UUID)
  declare rejected_by: string | null; // NEW: Who rejected

  @Column(DataType.DATE)
  declare rejected_at: Date | null; // NEW: When rejected

  @Column(DataType.TEXT)
  declare rejection_reason: string | null; // NEW: Rejection reason

  @Default([])
  @Column(DataType.ARRAY(DataType.TEXT))
  declare tags: string[];

  @Default({})
  @Column(DataType.JSONB)
  declare metadata: Record<string, any>;

  @Column(DataType.DATE)
  declare completed_at: Date | null;

  @BelongsTo(() => WorkspaceModel)
  declare workspace?: WorkspaceModel;

  @BelongsTo(() => ProductModel)
  declare product?: ProductModel;

  @BelongsTo(() => UserModel, 'assignee_id')
  declare assignee?: UserModel;

  @BelongsTo(() => UserModel, 'approved_by')
  declare approver?: UserModel;

  @BelongsTo(() => UserModel, 'rejected_by')
  declare rejector?: UserModel;

  @BelongsTo(() => SprintModel)
  declare sprint?: SprintModel;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}
