import express, { Request, Response } from 'express';

const app = express();
const port = Number(process.env.PORT) || 5000;

// Health check endpoint para UptimeRobot
app.get('/', (_req: Request, res: Response) => {
  res.json({ 
    status: 'online', 
    bot: 'eixo Discord Bot',
    timestamp: new Date().toISOString()
  });
});

// Status endpoint
app.get('/status', (_req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Ping endpoint simples
app.get('/ping', (_req: Request, res: Response) => {
  res.json({ message: 'pong' });
});

export function startServer() {
  app.listen(port, '0.0.0.0', () => {
    console.log(`🌐 Servidor HTTP rodando na porta ${port}`);
    console.log(`📡 Health check: http://localhost:${port}/`);
  });
}