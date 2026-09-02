import app from './app';
import { config } from './config/env';

const PORT = typeof config.port === 'string' ? parseInt(config.port) : config.port;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT} in ${config.nodeEnv} mode`);
  console.log(`Environment: ${config.nodeEnv}`);
});
