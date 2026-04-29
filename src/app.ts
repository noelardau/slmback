import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import config from './config.js';
import userRoutes from './routes/users.js';

const app = express();

app.use(logger(config.loggerLevel));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/healthcheck', (req, res) => {
  res.status(200).send('OK');
});

app.use('/users', userRoutes);

export default app;