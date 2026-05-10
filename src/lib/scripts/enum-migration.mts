import "dotenv/config";
import { Client } from "pg";

async function main() {
  console.log("🚀 Starting enum migration...");

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");

  const client = new Client({ connectionString });
  await client.connect();

  const exec = async (sql: string) => client.query(sql);

  try {
    await exec("BEGIN");

    // 1️⃣ Create OrderStatus enum if not exists
    await exec(`
      DO $$ BEGIN
        CREATE TYPE "OrderStatus" AS ENUM (
          'UNVERIFIED','PENDING','SHIPPED','DELIVERED',
          'FULFILLED','CANCELLATION_REQUESTED','CANCELLED'
        );
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    // 2️⃣ Create InvoiceStatus enum if not exists
    await exec(`
      DO $$ BEGIN
        CREATE TYPE "InvoiceStatus" AS ENUM (
          'PAID','OVERDUE','CANCELLED','UNPAID','PENDING'
        );
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    console.log("✅ Enums created (or already exist)");

    // 3️⃣ Normalize existing status data (only while the column is still text)
    await exec(`
      DO $$
      DECLARE t TEXT;
      BEGIN
        SELECT c.udt_name INTO t
        FROM information_schema.columns c
        WHERE c.table_schema = 'public' AND c.table_name = 'Order' AND c.column_name = 'status';

        IF t IN ('text','varchar','bpchar') THEN
          EXECUTE 'UPDATE "Order" SET status = UPPER(status) WHERE status IS NOT NULL';
        END IF;
      END $$;
    `);

    await exec(`
      DO $$
      DECLARE t TEXT;
      BEGIN
        SELECT c.udt_name INTO t
        FROM information_schema.columns c
        WHERE c.table_schema = 'public' AND c.table_name = 'Invoice' AND c.column_name = 'status';

        IF t IN ('text','varchar','bpchar') THEN
          EXECUTE 'UPDATE "Invoice" SET status = UPPER(status) WHERE status IS NOT NULL';
        END IF;
      END $$;
    `);

    console.log("✅ Existing status values normalized (when applicable)");

    // 4️⃣ Add scheduledAt column if missing
    await exec(`
      ALTER TABLE "Order"
      ADD COLUMN IF NOT EXISTS "scheduledAt" TIMESTAMP;
    `);
    console.log('✅ "scheduledAt" column added (if missing)');

    // 5️⃣ Populate scheduledAt = orderDate + 48 hours
    await exec(`
      UPDATE "Order"
      SET "scheduledAt" = "orderDate" + INTERVAL '48 hours'
      WHERE "orderDate" IS NOT NULL
        AND "scheduledAt" IS NULL;
    `);
    console.log("✅ scheduledAt values populated");

    // 6️⃣ Convert Order.status to enum if it isn't already
    await exec(`
      DO $$
      DECLARE t TEXT;
      BEGIN
        SELECT c.udt_name INTO t
        FROM information_schema.columns c
        WHERE c.table_schema = 'public' AND c.table_name = 'Order' AND c.column_name = 'status';

        IF t <> 'OrderStatus' THEN
          EXECUTE 'ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus" USING status::text::"OrderStatus"';
        END IF;
      END $$;
    `);

    // 7️⃣ Convert Invoice.status to enum if it isn't already
    await exec(`
      DO $$
      DECLARE t TEXT;
      BEGIN
        SELECT c.udt_name INTO t
        FROM information_schema.columns c
        WHERE c.table_schema = 'public' AND c.table_name = 'Invoice' AND c.column_name = 'status';

        IF t <> 'InvoiceStatus' THEN
          EXECUTE 'ALTER TABLE "Invoice" ALTER COLUMN "status" TYPE "InvoiceStatus" USING status::text::"InvoiceStatus"';
        END IF;
      END $$;
    `);

    console.log("✅ Status columns converted to enums (when applicable)");
    console.log("🎉 Migration completed successfully!");

    await exec("COMMIT");
  } catch (e) {
    try {
      await exec("ROLLBACK");
    } catch {
      // ignore rollback errors
    }
    throw e;
  } finally {
    await client.end();
  }
}

main()
  .catch((e) => {
    console.error("❌ Migration failed:", e);
    process.exit(1);
  });
