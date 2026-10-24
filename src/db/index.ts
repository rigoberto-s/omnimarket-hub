import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const g = globalThis as unknown as { pool?: Pool };
const pool =
  g.pool ?? new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
if (process.env.NODE_ENV !== "production") g.pool = pool;

export const db = drizzle(pool, { schema });
