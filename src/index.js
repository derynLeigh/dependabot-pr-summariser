const { App, Octokit } = require("@octokit/app");
const fs = require("fs");

// Load GitHub App credentials
const appId = process.env.GITHUB_APP_ID;
const privateKey = fs.readFileSync("../pr-summariser.2025-08-12.private-key.pem", "utf8");

// Initialize GitHub App
const app = new App({ appId, privateKey });

// Get installation token
async function getInstallationToken(installationId) {
  const { token } = await app.getInstallationAccessToken({ installationId });
  return token;
}

// Fetch Dependabot PRs
async function fetchDependabotPRs(owner, repo, installationToken) {
  const octokit = new Octokit({ auth: installationToken });

  const { data } = await octokit.pulls.list({
    owner,
    repo,
    state: "open",
  });

  return data.filter((pr) => pr.user.login === "dependabot[bot]");
}

// Format PR summary
function formatPRSummary(prs) {
  let summary = "### 📝 Daily Dependabot PR Summary\n\n";
  prs.forEach((pr) => {
    summary += `- [${pr.title}](${pr.html_url})\n`;
  });
  return summary;
}

// Main workflow
async function main() {
  const owner = "derynLeigh";
  const repo = "dependabot-pr-summariser";
  const installationId = Iv23ligt92Jfu3LOSCpB;

  const installationToken = await getInstallationToken(installationId);
  const prs = await fetchDependabotPRs(owner, repo, installationToken);
  const summary = formatPRSummary(prs);

  console.log(summary);
}

main();