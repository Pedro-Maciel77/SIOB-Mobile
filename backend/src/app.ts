import 'dotenv/config';
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AppDataSource } from './config/database';
import { errorHandler } from './middlewares/error.middleware';
import { authMiddleware } from './middlewares/auth.middleware';
import authRoutes from './api/routes/auth.routes';
import occurrenceRoutes from './api/routes/occurrence.routes';
import userRoutes from './api/routes/user.routes';
import vehicleRoutes from './api/routes/vehicle.routes';
import reportRoutes from './api/routes/report.routes';
import auditRoutes from './api/routes/audit.routes';
import logger, { stream } from './config/logger';
import morgan from 'morgan';
import { handleUploadError } from './middlewares/upload.middleware';

const app = express();

// Configurações de segurança
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:8081', // React Native
    'http://localhost:3000',
    'exp://localhost:19000', // Expo
    'capacitor://localhost',
    'ionic://localhost',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite por IP
  message: { error: 'Muitas requisições, tente novamente mais tarde.' }
});
app.use('/api/', limiter);

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream }));

// Health check
app.get('/health', async (req, res) => {
  try {
    await AppDataSource.query('SELECT 1');
    res.json({
      status: 'healthy',
      service: 'SIOB API',
      database: 'Neon PostgreSQL',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: 'Database connection failed'
    });
  }
});

app.use(handleUploadError);

// Rotas públicas
app.use('/api/auth', authRoutes);

// Rotas protegidas
app.use('/api/occurrences', authMiddleware, occurrenceRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/vehicles', authMiddleware, vehicleRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);
app.use('/api/audit', authMiddleware, auditRoutes);

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Tratamento de erros
app.use(errorHandler);

// Inicialização
async function startServer() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Banco de dados conectado (Neon PostgreSQL)');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 SIOB API rodando na porta ${PORT}`);
      console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Health: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();