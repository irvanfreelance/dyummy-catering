import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export default pool;
