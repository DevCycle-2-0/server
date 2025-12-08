import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  BelongsTo,
  ForeignKey,
} from "sequelize-typescript";

@Table({ tableName: "workspaces", timestamps: true, underscored: true })
export class Workspace extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  name!: string;

  @Column({ type: DataType.STRING(100), allowNull: false, unique: true })
  slug!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  ownerId!: string;

  @BelongsTo(() => User)
  owner!: User;

  @HasMany(() => Product)
  products!: Product[];

  @Column({ type: DataType.DATE, field: "created_at" })
  createdAt!: Date;

  @Column({ type: DataType.DATE, field: "updated_at" })
  updatedAt!: Date;
}

// ...existing imports...
import { User } from "./User.entity";
import { Product } from "./Product.entity";
