import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import dotenv from 'dotenv'

dotenv.config();

const auth = createAppAuth({
  appId: process.env.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_PRIVATE_KEY,
});

export async function getInstallationToken() {
  const { token } = await auth({
    type: 'installation',
    installationId: process.env.GITHUB_INSTALLATION_ID
  })
}

export async function fetchAllDependabotPRs() {
  const token = await getInstallationToken();
  const owner = 'derynLeigh';
  const repos = ['techronymsService', 'techronyms-user-service', 'dependabotPRSummariser'];

  return Promise.all(
    repos.map(repo => fetchDependabotPRs(token, owner, repo))
  ).then(results => results.flat());
}

export async function fetchDependabotPRs(token, owner, repo) {
  const octokit = new Octokit({
    auth: token,
  });

  const { data } = await octokit.pulls.list({
    owner,
    repo,
    state: 'open',
  });

  return data.filter((pr) => pr.user.login === 'dependabot[bot]');
}