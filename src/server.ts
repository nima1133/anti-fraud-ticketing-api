import 'dotenv/config';
import app from './app';
import { prisma } from '../lib/prisma';


console.log(process.env.NODE_ENV);
const startServer = async () => {
  try {
    await prisma.$connect();

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
