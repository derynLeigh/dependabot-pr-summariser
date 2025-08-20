import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { fetchAllDependabotPRs, AuthConfig } from './github.js';
import { errorHandler, handleErrorResponse } from './utils/errorHandler.js';

const app = express();
const port = 8080;

interface EnvConfig extends AuthConfig {
  PORT?: string;
}

function getEnvConfig(): EnvConfig {
  const config = {
    GITHUB_APP_ID: process.env.GITHUB_APP_ID,
    GITHUB_PRIVATE_KEY: process.env.GITHUB_PRIVATE_KEY,
    GITHUB_INSTALLATION_ID: process.env.GITHUB_INSTALLATION_ID,
  };

  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  return config as AuthConfig;
}

app.use(cors());

app.get('/api/prs', async (_, res) => {
  try {
    const prs = await fetchAllDependabotPRs(getEnvConfig(), 'derynLeigh', [
      'techronymsService',
      'techronyms-user-service',
    ]);
    res.json({
      data: prs,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleErrorResponse(res, error);
  }
});

app.use(errorHandler);

app.get('/api/prs', async (req, res) => {
  try {
    const config = getEnvConfig();
    const prs = await fetchAllDependabotPRs(config, 'derynLeigh', [
      'techronymsService',
      'techronyms-user-service',
    ]);
    res.json({
      data: prs,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleErrorResponse(res, error, { request: req });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
