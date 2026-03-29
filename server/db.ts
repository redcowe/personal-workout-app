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
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();
  console.log(`✅ MySQL connected → ${DB_HOST}:${DB_PORT}/${DB_NAME}${sslEnabled ? ' (SSL)' : ''}`);
}
