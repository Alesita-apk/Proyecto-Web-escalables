import cors from 'cors';
import express, { type Application } from 'express';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import accountRouter from '../routes/account.routes.ts';
import authRouter from '../routes/auth.routes.ts';
import reservationRouter from '../routes/reservation.routes.ts';
import siteRouter from '../routes/site.routes.ts';
import { errorHandler } from '../middleware/error.middleware.ts';

const frontendDirectory = resolve(
  fileURLToPath(new URL('.', import.meta.url)),
  '../../../Proyecto/dist/autocine/browser',
);

export class Server {
  private readonly app: Application;
  private readonly port: number;

  constructor() {
    this.app = express();
    this.port = Number(process.env['PORT'] ?? 8080);
    this.middlewares();
    this.routes();
  }

  private middlewares(): void {
    this.app.use(cors());
    this.app.use(express.json({ limit: '1mb' }));
  }

  private routes(): void {
    this.app.get('/api/health', (_req, res) => {
      res.json({ status: 'ok' });
    });
    this.app.use('/api/auth', authRouter);
    this.app.use('/api/account', accountRouter);
    this.app.use('/api/site', siteRouter);
    this.app.use('/api/reservations', reservationRouter);
    this.app.use('/api', (_req, res) => {
      res.status(404).json({ message: 'Ruta de API no encontrada.' });
    });
    if (existsSync(frontendDirectory)) {
      this.app.use(express.static(frontendDirectory));
      this.app.use((_req, res, next) => {
        res.sendFile(resolve(frontendDirectory, 'index.html'), (error) => {
          if (error) next(error);
        });
      });
    }
    this.app.use(errorHandler);
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`Servidor escuchando en el puerto ${this.port}.`);
    });
  }
}
