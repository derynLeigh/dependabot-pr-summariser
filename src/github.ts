import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import type { Endpoints } from '@octokit/types';

type ListPullsResponse =
  Endpoints['GET /repos/{owner}/{repo}/pulls']['response'];
type GitHubPR = ListPullsResponse['data'][0];

export type DependabotPR = GitHubPR;

export interface AuthConfig {
  GITHUB_APP_ID: string;
  GITHUB_PRIVATE_KEY: string;
  GITHUB_INSTALLATION_ID: string;
}

export function isDependabotPR(pr: GitHubPR): pr is DependabotPR {
  return pr.user?.login === 'dependabot[bot]';
}

export async function getGitHubToken(config: AuthConfig): Promise<string> {
  const auth = createAppAuth({
    appId: config.GITHUB_APP_ID,
    privateKey: config.GITHUB_PRIVATE_KEY.replace(/\\n/g, '\n'),
  });

  const { token } = await auth({
    type: 'installation',
    installationId: config.GITHUB_INSTALLATION_ID,
  });

  return token;
}

export async function fetchAllDependabotPRs(
  config: AuthConfig,
  owner: string,
  repos: string[]
): Promise<DependabotPR[]> {
  try {
    const token = await getGitHubToken(config);
    const allPRs = await Promise.all(
      repos.map(async (repo) => {
        try {
          return await fetchDependabotPRs(token, owner, repo);
        } catch (error) {
          console.error(`Failed to fetch PRs from ${repo}:`, error);
          return [];
        }
      })
    );
    return allPRs.flat();
  } catch (error) {
    console.error('Failed to authenticate:', error);
    throw new Error('Authentication failed');
  }
}

export async function fetchDependabotPRs(
  token: string,
  owner: string,
  repo: string
): Promise<GitHubPR[]> {
  const octokit = new Octokit({ auth: token });

  const { data } = await octokit.pulls.list({
    owner,
    repo,
    state: 'open',
  });

  return data.filter(isDependabotPR);
}
