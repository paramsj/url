import express from 'express';
import cors from 'cors';

app.use(cors({
    origin: process.env.CORS_ORIGIN,
}));
app.use(express.json());


const app = express();

export {app};