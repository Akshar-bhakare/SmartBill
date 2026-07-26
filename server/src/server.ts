import app from './app.js';
import { connectDB } from './config/database.js';
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

const DEFAULT_PORT = Number(process.env.PORT || 5000);

async function startServer() {
  await connectDB();

  const port = await getAvailablePort(DEFAULT_PORT);
  const server = http.createServer(app);

  server.listen(port, () => {
    console.log(`🚀 SmartBill MVC Server running on http://localhost:${port}`);
  });
}

function getAvailablePort(preferredPort: number, attempts = 20): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = http.createServer();

    server.once('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE' && attempts > 0) {
        server.close(() => {
          resolve(getAvailablePort(preferredPort + 1, attempts - 1));
        });
        return;
      }

      reject(error);
    });

    server.once('listening', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : preferredPort;
      server.close(() => resolve(port));
    });

    server.listen(preferredPort);
  });
}

startServer();
