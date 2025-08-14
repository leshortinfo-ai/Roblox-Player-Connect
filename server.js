import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { router as apiRouter } from './api.js';

dotenv.config();
const app = express();

// ---- Security & perf middlewares ----
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(compression());
app.use(express.json({ limit: '100kb' }));
app.use(morgan('tiny'));

// ---- CORS ----
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:4173';
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type'],
  maxAge: 86400,
  credentials: false
}));

// ---- Rate Limiting ----
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,             // 60 requêtes/min/IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ---- Routes ----
app.get('/health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));
app.use('/api', apiRouter);

// ---- Errors ----
app.use((req, res) => res.status(404).json({ error: 'Not Found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  console.log(`[roblox-fan-backend] running on http://localhost:${port}`);
});