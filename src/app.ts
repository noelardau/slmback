import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import config from './config.js';
import collectifRoutes from './routes/collectif.js';
import membreRoutes from './routes/membre.js';
import tournoiRoutes from './routes/tournoi.js';
import guestRoutes from './routes/guest.js';
import participantRoutes from './routes/participant.js';
import performanceRoutes from './routes/performance.js';
import uploadRoutes from './routes/upload.js';
import noteRoutes from './routes/note.js';
import penaliteRoutes from './routes/penalite.js';
import statisticsRoutes from './routes/statistics.js';

const app = express();

const corsOrigin = process.env.CORS_ORIGIN 

app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));

app.use(logger(config.loggerLevel));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/healthcheck', (req, res) => {
  res.status(200).send('OK');
});

app.use('/collectif', collectifRoutes);
app.use('/collectif', membreRoutes);
app.use('/collectif', tournoiRoutes);
app.use('/api', guestRoutes);
app.use('/api', participantRoutes);
app.use('/api', performanceRoutes);
app.use('/api', noteRoutes);
app.use('/api', penaliteRoutes);
app.use('/api', uploadRoutes);
app.use('/api', statisticsRoutes);

export default app;