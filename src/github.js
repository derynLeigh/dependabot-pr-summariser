import { Octokit } from '@octokit/rest';

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