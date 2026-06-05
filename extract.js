const fs = require('fs');
const cheerio = require('cheerio');

const htmlPath = 'C:/Users/diskonekted/.gemini/antigravity/brain/a774d4fd-73fa-4bad-901d-0fb23bb0b8ae/.system_generated/steps/82/content.md';
const content = fs.readFileSync(htmlPath, 'utf8');

// The file has some markdown frontmatter, let's just pass the whole thing to cheerio
const $ = cheerio.load(content);

const products = [];

// Assuming OpenSID lapak structure
$('.product-item, .item, .col-md-3').each((i, el) => {
    // We will look for typical product elements
    const title = $(el).find('h3, h4, .product-title, .title').text().trim();
    if (!title) return;
    
    const price = $(el).find('.price, .harga').text().trim();
    const image = $(el).find('img').attr('src');
    const vendor = $(el).find('.vendor, .pelapak, .nama').text().trim();
    const phone = $(el).find('a[href^="https://wa.me"], a[href^="whatsapp://"]').attr('href');
    
    // Find desc if any
    const description = $(el).find('.description, .desc').text().trim();

    products.push({
        title,
        price,
        image,
        vendor,
        phone,
        description
    });
});

fs.writeFileSync('i:/pawonsjg/scraped_products.json', JSON.stringify(products, null, 2));
console.log(`Extracted ${products.length} potential products.`);
