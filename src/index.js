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
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateSummary();
}
