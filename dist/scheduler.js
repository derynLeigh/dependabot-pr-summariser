import cron from 'node-cron';
import fs from 'fs';
import { fetchAllDependabotPRs } from './github.js';
const DEFAULT_CONFIG = {
    cronSchedule: '0 7 * * *',
    outputPath: 'summary.json',
    auth: {
        GITHUB_APP_ID: process.env.GITHUB_APP_ID,
        GITHUB_PRIVATE_KEY: process.env.GITHUB_PRIVATE_KEY,
        GITHUB_INSTALLATION_ID: process.env.GITHUB_INSTALLATION_ID,
    },
    owner: 'derynLeigh',
    repos: [
        'techronymsService',
        'techronyms-user-service',
        'dependabot-pr-summariser',
    ],
};
export function scheduleDailySummary(config = {}) {
    const mergedConfig = {
        ...DEFAULT_CONFIG,
        ...config,
    };
    cron.schedule(mergedConfig.cronSchedule, async () => {
        try {
            const prs = await fetchAllDependabotPRs(mergedConfig.auth, mergedConfig.owner, mergedConfig.repos);
            storeDailySummary(prs, mergedConfig.outputPath);
            logSuccess(prs.length);
        }
        catch (error) {
            handleSchedulerError(error);
        }
    });
}
function storeDailySummary(prs, outputPath) {
    const summary = {
        generatedAt: new Date().toISOString(),
        count: prs.length,
        prs: prs.map((p) => ({
            id: p.id,
            title: p.title,
            url: p.url,
            repo: p.repo,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        })),
    };
    fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2), 'utf8');
}
function validateConfig(config) {
    const requiredAuthFields = [
        'GITHUB_APP_ID',
        'GITHUB_PRIVATE_KEY',
        'GITHUB_INSTALLATION_ID',
    ];
    const missing = requiredAuthFields.filter((field) => !config.auth[field]);
    if (missing.length > 0) {
        throw new Error(`Missing auth configuration: ${missing.join(', ')}`);
    }
    if (!config.repos || config.repos.length === 0) {
        throw new Error('No repositories configured');
    }
}
function logSuccess(prCount) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Successfully generated summary with ${prCount} PRs`);
}
function handleSchedulerError(error) {
    const timestamp = new Date().toISOString();
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`[${timestamp}] Scheduler Error:`);
    console.error('  Reason:', errorMessage);
    if (error instanceof Error && error.stack) {
        console.error('  Stack trace:', error.stack);
    }
}
