import { createAppAuth } from "@octokit/auth-app";
import dotenv from "dotenv";
import { fetchDependabotPRs } from "./github.js";
import { writeHTMLFile } from "./html.js";

dotenv.config();

const privateKey = process.env.GITHUB_PRIVATE_KEY;

const auth = createAppAuth({
  appId: process.env.GITHUB_APP_ID,
  privateKey,
});

async function main() {
  try {
    const { token } = await auth({ type: "installation", installationId: process.env.GITHUB_INSTALLATION_ID });
    console.log("Installation Token:", token);

    const owner = "derynLeigh";
    const repos = ['techronymsService', 'techronyms-user-service', 'dependabot-pr-summariser'];
    let allPRs = [];

    for (const repo of repos) {
      console.log(`Fetching PRs from ${repo}...`);
      const prs = await fetchDependabotPRs(token, owner, repo);
      allPRs = allPRs.concat(prs);
    }
    
    console.log('All Dependabot PRs:', allPRs);

    const summary = formatPRSummary(allPRs);
    await writeHTMLFile("summary.html", summary);
    console.log("Summary written to summary.html!");
  } catch (error) {
    console.error("Error:", error);
  }
}

function formatPRSummary(prs) {
  let summary = "<h1>📝 Daily Dependabot PR Summary</h1>\n<ul>\n";
  prs.forEach((pr) => {
    summary += `  <li><a href="${pr.html_url}">${pr.title}</a> (Repo: ${pr.head.repo.name}</li>\n`;
  });
  summary += "</ul>";
  return summary;
}

main();