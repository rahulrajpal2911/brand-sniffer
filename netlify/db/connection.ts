import mysql, { PoolOptions, Pool } from 'mysql2/promise';

// Database connection options
const poolOptions: PoolOptions = {
  host: Netlify.env.get('MYSQL_DB_HOST'),
  user: Netlify.env.get('MYSQL_DB_USER'),
  password: Netlify.env.get('MYSQL_DB_PASSWORD'),
  database: Netlify.env.get('MYSQL_DB_NAME'),
  waitForConnections: true,
  connectionLimit: 10, // Maximum number of connections in the pool
  queueLimit: 0,       // No limit on queued requests
  rowsAsArray: false,  // Ensure rows are returned as objects, not arrays
};

// Create a connection pool
const conn: Pool = mysql.createPool(poolOptions);

export { conn };
