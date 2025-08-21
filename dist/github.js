import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
export function toPRdto(pr) {
    return {
        id: pr.id,
        title: pr.title,
        url: pr.html_url,
        repo: pr.head?.repo?.name ?? '',
        createdAt: pr.created_at,
        updatedAt: pr.updated_at,
    };
}
export async function getGitHubToken(config) {
    const auth = createAppAuth({
        appId: config.GITHUB_APP_ID,
        privateKey: config.GITHUB_PRIVATE_KEY,
    });
    const { token } = await auth({
        type: 'installation',
        installationId: config.GITHUB_INSTALLATION_ID,
    });
    return token;
}
export async function fetchDependabotPRs(token, owner, repo) {
    const octokit = new Octokit({ auth: token });
    const { data } = await octokit.pulls.list({
        owner,
        repo,
        state: 'open',
    });
    return data.filter((pr) => pr.user?.login === 'dependabot[bot]');
}
export async function fetchAllDependabotPRs(config, owner, repos) {
    const token = await getGitHubToken(config);
    const results = await Promise.all(repos.map(async (repo) => {
        try {
            const prs = await fetchDependabotPRs(token, owner, repo);
            return prs.map(toPRdto);
        }
        catch (err) {
            console.error(`Failed to fetch PRs from repo "${repo}":`, err);
            return [];
        }
    }));
    return results.flat();
}
