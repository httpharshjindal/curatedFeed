import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import "dotenv/config";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
 }
});

const db = drizzle(pool);

async function main() {
  console.log("Migration started...");
  try {
    await migrate(db, { 
      migrationsFolder: "drizzle",
      migrationsSchema: "public"
    });
    console.log("Migration completed!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed!", error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Migration failed!");
  console.error(err);
  process.exit(1);
}); 