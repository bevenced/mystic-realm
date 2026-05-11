/**
 * Database client wrapper.
 * Provides tagged-template `sql` compatible with @vercel/postgres API.
 * Uses pg (node-postgres) with SSL disabled for local connections.
 */
import { Pool } from "pg";

const url = process.env.POSTGRES_URL || "";
const isLocal = url.includes("localhost") || url.includes("127.0.0.1");

const pool = new Pool({
  connectionString: url,
  ssl: isLocal ? false : undefined,
  max: 10,
});

export async function sql(
  strings: TemplateStringsArray | readonly string[],
  ...values: any[]
): Promise<{ rows: any[] }> {
  // Build parameterized query from tagged template
  let text = "";
  for (let i = 0; i < strings.length; i++) {
    text += strings[i];
    if (i < values.length) {
      text += `$${i + 1}`;
    }
  }
  const result = await pool.query(text, values);
  return result;
}
