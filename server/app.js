//this file server/app.js is for the Express application. It builds the API, export default app. It sets up the main app, middleware, and routes.

import express from 'express';
import cors from 'cors';
import apiRouter from './api/index.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.use('/api', apiRouter); // adjust prefix to match your CONTRACT.md

app.get('/health', (req, res) => res.json({ status: 'ok' }));

export default app;