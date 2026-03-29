import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { testConnection } from './db.js';
import exercisesRouter from './routes/exercises.js';
import templatesRouter from './routes/templates.js';
import logsRouter from './routes/logs.js';

const app = express();
const PORT = Number(process.env.SERVER_PORT ?? 3001);

app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/exercises', exercisesRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/logs', logsRouter);

// Health check — reflects DB connectivity
app.get('/api/health', async (_req, res) => {
  try {
    await testConnection();
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'degraded', db: 'disconnected', timestamp: new Date().toISOString() });
  }
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message ?? 'Internal server error' });
});

// Start the server regardless of DB status so Vite proxy can reach it.
// Individual routes will return 503 if the DB is unreachable.
app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  testConnection().catch(() => {
    console.error('⚠️  Running without a DB connection — API calls will fail until MySQL is reachable.');
  });
});
