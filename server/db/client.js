import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export default db;