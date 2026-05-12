import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import config from './config.js';
import collectifRoutes from './routes/collectif.js';
import membreRoutes from './routes/membre.js';

const app = express();

app.use(logger(config.loggerLevel));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/healthcheck', (req, res) => {
  res.status(200).send('OK');
});

app.use('/collectif', collectifRoutes);
app.use('/collectif', membreRoutes);

export default app;