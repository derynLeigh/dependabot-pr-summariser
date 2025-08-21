import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { fetchAllDependabotPRs } from './github.js';
import { errorHandler, handleErrorResponse } from './utils/errorHandler.js';
dotenv.config();
const app = express();
const port = 8080;
function getEnvConfig() {
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
    return config;
}
app.use(cors());
app.get('/api/prs', async (_req, res) => {
    try {
        const config = getEnvConfig();
        const prs = await fetchAllDependabotPRs(config, 'derynLeigh', [
            'techronymsService',
            'techronyms-user-service',
            'dependabot-pr-summariser',
        ]);
        res.json({
            data: prs,
            generatedAt: new Date().toISOString(),
            count: prs.length,
        });
    }
    catch (error) {
        handleErrorResponse(res, error, { request: _req });
    }
});
app.use(errorHandler);
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
