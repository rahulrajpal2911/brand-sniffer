import mysql, { PoolOptions, Pool } from "mysql2/promise";
import { CONFIG } from "./config";

// Database connection options
const poolOptions: PoolOptions = {
  host: CONFIG.MYSQL.HOST,
  user: CONFIG.MYSQL.USER,
  password: CONFIG.MYSQL.PASSWORD,
  database: CONFIG.MYSQL.DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Maximum number of connections in the pool
  queueLimit: 0, // No limit on queued requests
  rowsAsArray: false, // Ensure rows are returned as objects, not arrays
};

// Create a connection pool
const conn: Pool = mysql.createPool(poolOptions);

export { conn };
