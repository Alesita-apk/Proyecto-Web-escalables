import 'dotenv/config';
import { connectDatabase } from './config/database.ts';
import { Server } from './models/server.ts';

const startServer = async (): Promise<void> => {
  await connectDatabase();
  const server = new Server();
  server.listen();
};

startServer().catch((error: unknown) => {
  console.error('No fue posible iniciar el servidor.', error);
  process.exitCode = 1;
});
