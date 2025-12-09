// src/infrastructure/database/sequelize.ts
import { Sequelize } from "sequelize-typescript";
import { config } from "@config/env";
import { UserModel } from "@modules/auth/infrastructure/persistence/models/UserModel";
import { WorkspaceModel } from "@modules/auth/infrastructure/persistence/models/WorkspaceModel";
import { ProductModel } from "@modules/products/infrastructure/persistence/models/ProductModel";
import { FeatureModel } from "@modules/features/infrastructure/persistence/models/FeatureModel";
import { TaskModel } from "@modules/tasks/infrastructure/persistence/models/TaskModel";
import { TimeLogModel } from "@modules/tasks/infrastructure/persistence/models/TimeLogModel";
import { CommentModel } from "@modules/tasks/infrastructure/persistence/models/CommentModel";

export const sequelize = new Sequelize({
  dialect: "postgres",
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  username: config.database.username,
  password: config.database.password,
  logging: config.database.logging ? console.log : false,
  models: [
    UserModel,
    WorkspaceModel,
    ProductModel,
    FeatureModel,
    TaskModel,
    TimeLogModel,
    CommentModel,
  ],
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    if (config.app.env === "development") {
      await sequelize.sync({ alter: true });
      console.log("Database synchronized.");
    }
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }
};
