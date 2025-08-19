import cron from 'node-cron';
import { fetchAllDependabotPRs } from './github';
import { writeHTMLFile } from './html';

export function scheduleDailySummary() {
    cron.schedule('0 7 * * *', async () =>{
        try {
            const prs = await fetchAllDependabotPRs();
            const summary = formatPRSummary(prs);
            await writeHTMLFile('summary.html',summary);
            console.log('Daily summary generated at', new Date().toISOString());            
        } catch(error) {
            console.error('Error generating daily summary:', error);
        }
    });

function formatPRSummary(prs) {
  let summary = "<h1>📝 Daily Dependabot PR Summary</h1>\n<ul>\n";
  prs.forEach((pr) => {
    summary += `  <li><a href="${pr.html_url}">${pr.title}</a> (Repo: ${pr.head.repo.name}</li>\n`;
  });
  summary += "</ul>";
  return summary;
}

}