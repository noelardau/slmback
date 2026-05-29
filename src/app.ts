import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import config from './config.js';
import collectifRoutes from './routes/collectif.js';
import membreRoutes from './routes/membre.js';
import tournoiRoutes from './routes/tournoi.js';
import guestRoutes from './routes/guest.js';
import participantRoutes from './routes/participant.js';
import { openApiSpec } from './docs/openapi.js';
import swaggerUi from 'swagger-ui-express';

const app = express();

app.use(logger(config.loggerLevel));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/healthcheck', (req, res) => {
  res.status(200).send('OK');
});

// Swagger UI documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
  customSiteTitle: 'SLAM API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
}));

app.use('/collectif', collectifRoutes);
app.use('/collectif', membreRoutes);
app.use('/collectif', tournoiRoutes);
app.use('/api', guestRoutes);
app.use('/api', participantRoutes);

export default app;