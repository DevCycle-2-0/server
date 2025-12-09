import cors from "cors";
import { config } from "@config/env";

export const corsMiddleware = cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
});
