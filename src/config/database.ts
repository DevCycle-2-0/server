import { Sequelize } from 'sequelize-typescript';
import { config } from './env';
import path from 'path';

// Import all models directly
import { UserModel } from '@infrastructure/database/models/UserModel';
import { WorkspaceModel } from '@infrastructure/database/models/WorkspaceModel';
import { WorkspaceMemberModel } from '@infrastructure/database/models/WorkspaceMemberModel';
import { WorkspaceInviteModel } from '@infrastructure/database/models/WorkspaceInviteModel';
import { ProductModel } from '@infrastructure/database/models/ProductModel';
import { FeatureModel } from '@infrastructure/database/models/FeatureModel';
import { FeatureVoteModel } from '@infrastructure/database/models/FeatureVoteModel';
import { SprintModel } from '@infrastructure/database/models/SprintModel';
import { TaskModel } from '@infrastructure/database/models/TaskModel';
import { TimeLogModel } from '@infrastructure/database/models/TimeLogModel';
import { BugModel } from '@infrastructure/database/models/BugModel';
import { ReleaseModel } from '@infrastructure/database/models/ReleaseModel';
import { ReleaseFeatureModel } from '@infrastructure/database/models/ReleaseFeatureModel';
import { CommentModel } from '@infrastructure/database/models/CommentModel';

export const sequelize = new Sequelize({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  username: config.database.user,
  password: config.database.password,
  dialect: 'postgres',
  logging: config.app.env === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Add models manually
sequelize.addModels([
  UserModel,
  WorkspaceModel,
  WorkspaceMemberModel,
  WorkspaceInviteModel,
  ProductModel,
  FeatureModel,
  FeatureVoteModel,
  SprintModel,
  TaskModel,
  TimeLogModel,
  BugModel,
  ReleaseModel,
  ReleaseFeatureModel,
  CommentModel,
]);

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    if (config.app.env === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database synchronized.');
    }
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};
