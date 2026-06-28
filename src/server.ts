import { Pool } from 'pg';
import 'dotenv/config';
import app from './app';

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: Number(process.env.DATABASE_PORT),
});
console.log(process.env.NODE_ENV);
const startServer = async () => {
  try {
    await pool.connect();

    console.log('db connected');

    app.listen(process.env.PORT, () => {
      console.log(`server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error('db error', error);
    process.exit(1);
  }
};

startServer();
