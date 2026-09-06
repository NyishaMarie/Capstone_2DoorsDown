import express from 'express';
import cors from 'cors';
import apiRouter from './api/index.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.use('/api', apiRouter); // adjust prefix to match your CONTRACT.md

app.get('/health', (req, res) => res.json({ status: 'ok' }));

export default app;