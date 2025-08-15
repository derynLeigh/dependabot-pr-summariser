import fs from 'fs';

export async function writeHTMLFile(filename, content) {
    const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dependabot PR Summary</title>
    </head>
    <body>
        ${content}
    </body>
    </html>`;

    fs.writeFileSync(filename, html);
}