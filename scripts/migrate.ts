import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Required for Node.js environment (not browser)
neonConfig.webSocketConstructor = ws;

async function migrate() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  const sqlPath = path.resolve(
    process.cwd(),
    "refs/skema_seed_erp_catering_dengan_cost_control.sql"
  );
  const sqlContent = fs.readFileSync(sqlPath, "utf8");

  console.log("🚀 Starting migration...");

  try {
    await client.query("BEGIN");
    await client.query(sqlContent);
    await client.query("COMMIT");
    console.log("✅ Migration completed successfully!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed, rolled back:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
