import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

const app = express();

// Trust reverse proxy (Nginx, cloud load balancers) so req.ip resolves real client IP
app.set('trust proxy', true);

const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : ['http://localhost:3000', 'http://localhost', 'http://localhost:8080'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

import authRouter from './routes/auth.routes.js';
import linkRouter from './routes/link.routes.js';
import healthRouter from './routes/health.routes.js';
import { redirectToOriginalUrl } from './controllers/link.controllers.js';

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/links', linkRouter);
app.use('/api/v1/status', healthRouter);

app.get('/:shortCode', redirectToOriginalUrl);

export { app };