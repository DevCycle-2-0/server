import { Sequelize } from "sequelize-typescript";
import path from "path";

export const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "devcycle",
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  models: [path.join(__dirname, "../../domain/entities")],
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true });
      console.log("✅ Database models synchronized");
    }
  } catch (error) {
    console.error("❌ Unable to connect to database:", error);
    process.exit(1);
  }
};
