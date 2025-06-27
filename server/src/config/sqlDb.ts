import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

// SQL Server configuration
const sqlConfig: sql.config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  server: process.env.SQL_SERVER || 'localhost',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true, // Required for Azure
    trustServerCertificate: false, // Change to true for local dev / self-signed certs
    enableArithAbort: true
  }
};

// Test the database connection
export const testConnection = async (): Promise<void> => {
  try {
    const pool = await sql.connect(sqlConfig);
    console.log('Successfully connected to Azure SQL Database');
    await pool.close();
  } catch (err) {
    console.error('Database connection failed:', err);
    throw err;
  }
};

// Get a database connection
export const getConnection = async (): Promise<sql.ConnectionPool> => {
  try {
    const pool = await sql.connect(sqlConfig);
    return pool;
  } catch (err) {
    console.error('Error getting database connection:', err);
    throw err;
  }
};

// Export the SQL object for direct use if needed
export { sql };
