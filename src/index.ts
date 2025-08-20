import { fetchAllDependabotPRs } from './github.js';
import { writeHTMLFile } from './html.js';

export async function generateSummary() {
  try {
    const prs = await fetchAllDependabotPRs();
    const summary = formatPRSummary(prs);
    await writeHTMLFile('summary.html', summary);
    console.log('Summary written to summary.html!');
  } catch (error) {
    console.error('Error:', error);
  }
  function formatPRSummary(prs) {
    let summary = '<h1>📝 Daily Dependabot PR Summary</h1>\n<ul>\n';
    prs.forEach((pr) => {
      summary += `  <li><a href="${pr.html_url}">${pr.title}</a> (Repo: ${pr.head.repo.name}</li>\n`;
    });
    summary += '</ul>';
    return summary;
  }

  if (import.meta.url === `file://${process.argv[1]}`) {
    generateSummary();
  }
}
