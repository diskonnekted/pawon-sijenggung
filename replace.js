const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content
    .replace(/Desa Sijenggung/g, 'Desa Sijenggung')
    .replace(/desa sijenggung/g, 'desa sijenggung')
    .replace(/Desa sijenggung/g, 'Desa sijenggung')
    .replace(/Sijenggung/g, 'Sijenggung')
    .replace(/sijenggung/g, 'sijenggung')
    .replace(/SIJENGGUNG/g, 'SIJENGGUNG')
    .replace(/Desa/g, 'Desa')
    .replace(/desa/g, 'desa')
    .replace(/DESA/g, 'DESA');

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkSync(currentDirPath) {
  fs.readdirSync(currentDirPath).forEach(function (name) {
    var filePath = path.join(currentDirPath, name);
    var stat = fs.statSync(filePath);
    if (stat.isFile()) {
      if (!filePath.includes('.git') && 
          !filePath.includes('node_modules') && 
          !filePath.includes('package-lock.json') &&
          !name.endsWith('.jpg') && !name.endsWith('.png') && !name.endsWith('.svg') && !name.endsWith('.ico')) {
        replaceInFile(filePath);
      }
    } else if (stat.isDirectory()) {
      if (name !== '.git' && name !== 'node_modules' && name !== '.next') {
        walkSync(filePath);
      }
    }
  });
}

walkSync('.');
console.log('Done!');
