const fs = require('fs');
const cheerio = require('cheerio');

const htmlPath = 'C:/Users/diskonekted/.gemini/antigravity/brain/a774d4fd-73fa-4bad-901d-0fb23bb0b8ae/.system_generated/steps/82/content.md';
const content = fs.readFileSync(htmlPath, 'utf8');
const $ = cheerio.load(content);

$('script').each((i, el) => {
    const html = $(el).html();
    if (html && html.includes('apiKategori')) {
        console.log(html.substring(0, 1000));
        console.log('... truncated ...');
    }
});
