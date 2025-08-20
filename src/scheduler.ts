import cron from 'node-cron';
import fs from 'fs';
import { fetchAllDependabotPRs } from './github.js';
import type { AuthConfig, DependabotPR } from './github.js';

interface SchedulerConfig {
  cronSchedule: string;
  outputPath: string;
  auth: AuthConfig;
  owner: string;
  repos: string[];
}

const DEFAULT_CONFIG: SchedulerConfig = {
  cronSchedule: '0 7 * * *',
  outputPath: 'summary.html',
  auth: {
    GITHUB_APP_ID: process.env.GITHUB_APP_ID!,
    GITHUB_PRIVATE_KEY: process.env.GITHUB_PRIVATE_KEY!,
    GITHUB_INSTALLATION_ID: process.env.GITHUB_INSTALLATION_ID!,
  },
  owner: 'derynLeigh',
  repos: [
    'techronymsService',
    'techronyms-user-service',
    'dependabot-pr-summariser',
  ],
};

export function scheduleDailySummary(
  config: Partial<SchedulerConfig> = {}
): void {
  const mergedConfig: SchedulerConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    auth: {
      ...DEFAULT_CONFIG.auth,
      ...config.auth,
    },
  };

  validateConfig(mergedConfig);

  cron.schedule(mergedConfig.cronSchedule, async () => {
    try {
      const prs = await fetchAllDependabotPRs(
        mergedConfig.auth,
        mergedConfig.owner,
        mergedConfig.repos
      );
      storeDailySummary(prs);
      logSuccess(prs.length);
    } catch (error: unknown) {
      handleSchedulerError(error);
    }
  });
}

function storeDailySummary(prs: DependabotPR[]): void {
  const summary = {
    generatedAt: new Date().toISOString(),
    count: prs.length,
    prs: prs.map((pr) => ({
      id: pr.id,
      title: pr.title,
      url: pr.html_url,
      repo: pr.head.repo.name,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
    })),
  };
  fs.writeFileSync('data/daily-summary.json', JSON.stringify(summary));
}

function validateConfig(config: SchedulerConfig): void {
  const requiredAuthFields = [
    'GITHUB_APP_ID',
    'GITHUB_PRIVATE_KEY',
    'GITHUB_INSTALLATION_ID',
  ];

  const missing = requiredAuthFields.filter(
    (field) => !config.auth[field as keyof AuthConfig]
  );

  if (missing.length > 0) {
    throw new Error(`Missing auth configuration: ${missing.join(', ')}`);
  }

  if (!config.repos || config.repos.length === 0) {
    throw new Error('No repositories configured');
  }
}

function logSuccess(prCount: number): void {
  const timestamp = new Date().toISOString();
  console.log(
    `[${timestamp}] Successfully generated summary with ${prCount} PRs`
  );
}

function handleSchedulerError(error: unknown): void {
  const timestamp = new Date().toISOString();
  const errorMessage =
    error instanceof Error ? error.message : 'Unknown error occurred';

  console.error(`[${timestamp}] Scheduler Error:`);
  console.error('  Reason:', errorMessage);

  if (error instanceof Error && error.stack) {
    console.error('  Stack trace:', error.stack);
  }
}
