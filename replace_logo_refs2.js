const fs = require('fs');
const files = [
  'i:/pawonsjg/public/manifest.json',
  'i:/pawonsjg/src/app/layout.tsx',
  'i:/pawonsjg/src/app/mobile/page.tsx',
  'i:/pawonsjg/src/components/Navbar.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/logo\.png/g, 'logo-transparent.png');
  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
}
