import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createLogger } from '@discovery-copilot/shared';
import { loadConfig } from '@discovery-copilot/shared';
import { sessionRouter } from './routes/session';
import { queryRouter } from './routes/query';
import { decisionRouter } from './routes/decision';
import { feedbackRouter } from './routes/feedback';
import { memoryRouter } from './routes/memory';
import { tenantRouter } from './routes/tenant';
import { adminRouter } from './routes/admin';
import { filtersRouter } from './routes/filters';
import { behaviorRouter } from './routes/behavior';
import { redditRouter } from './routes/reddit';
import { errorHandler } from './middleware/error-handler';
import { rateLimiter } from './middleware/rate-limit';

const logger = createLogger('api');
const config = loadConfig();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin:
      config.env === 'production'
        ? process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
        : '*',
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(rateLimiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '0.1.0', timestamp: new Date().toISOString() });
});

app.use('/api/v1/sessions', sessionRouter);
app.use('/api/v1/query', queryRouter);
app.use('/api/v1/decide', decisionRouter);
app.use('/api/v1/feedback', feedbackRouter);
app.use('/api/v1/memory', memoryRouter);
app.use('/api/v1/tenants', tenantRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/filters', filtersRouter);
app.use('/api/v1/behavior', behaviorRouter);
app.use('/api/v1/reddit', redditRouter);

app.use(errorHandler);

app.listen(config.port, () => {
  logger.info(`Discovery Copilot API running on port ${config.port}`, {
    env: config.env,
    features: config.features,
  });
});

export default app;
