import 'dotenv/config';
import mysql from 'mysql2/promise';

const {
  DB_HOST = 'localhost',
  DB_PORT = '3306',
  DB_NAME = 'workout_app',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_SSL = 'false',
  DB_SSL_REJECT_UNAUTHORIZED = 'true',
} = process.env;

const sslEnabled = DB_SSL === 'true';

export const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
  ...(sslEnabled && {
    ssl: { rejectUnauthorized: DB_SSL_REJECT_UNAUTHORIZED !== 'false' },
  }),
});

export async function testConnection(): Promise<void> {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log(`✅ MySQL connected → ${DB_HOST}:${DB_PORT}/${DB_NAME}${sslEnabled ? ' (SSL)' : ''}`);
  } catch (err: any) {
    const code = err.code ?? '';
    const hints: Record<string, string> = {
      ECONNREFUSED: `Connection refused — check DB_HOST (${DB_HOST}) and DB_PORT (${DB_PORT}) are correct and the server is reachable.`,
      ENOTFOUND:    `Host not found — DB_HOST "${DB_HOST}" could not be resolved. Check for typos.`,
      ETIMEDOUT:    `Connection timed out — the host is reachable but not responding on port ${DB_PORT}. Check firewall/security group rules.`,
      ER_ACCESS_DENIED_ERROR: `Access denied — wrong DB_USER ("${DB_USER}") or DB_PASSWORD.`,
      ER_BAD_DB_ERROR:        `Unknown database "${DB_NAME}" — run "npm run db:setup" to create it, or check DB_NAME.`,
      UNABLE_TO_VERIFY_LEAF_SIGNATURE: `SSL cert error — try setting DB_SSL_REJECT_UNAUTHORIZED=false in .env if your provider uses a self-signed cert.`,
    };
    const hint = hints[code] ?? err.message;
    console.error(`❌ MySQL connection failed [${code}]: ${hint}`);
    throw err;
  }
}
