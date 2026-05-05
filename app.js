import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { url } from 'inspector';
import bodyParser from 'body-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

import authRouter from './routes/auth.routes.js';
import linkRouter from './routes/link.routes.js';
import healthRouter from './routes/health.routes.js';
import { redirectToOriginalUrl } from './controllers/link.controllers.js';

app.use('/api/v1/auth',authRouter);
app.use('/api/v1/links',linkRouter);
app.use('/api/v1/status',healthRouter);

app.get('/:shortCode',redirectToOriginalUrl);

export {app};