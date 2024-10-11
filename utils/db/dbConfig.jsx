import { neon } from "@neondatabase/serverless";

import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

const sql = neon(
  "postgresql://neondb_owner:xyDszWq49UJh@ep-soft-violet-a5vv99sd.us-east-2.aws.neon.tech/blockrights_test?sslmode=require"
);

export const db = drizzle(sql, { schema });
