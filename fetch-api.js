const https = require('https');

https.get('https://sijenggung-banjarnegara.desa.id/internal_api/lapak/produk', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Total items:', parsed.data.length);
      if (parsed.data.length > 0) {
        console.log('Sample product:', JSON.stringify(parsed.data[0], null, 2));
      }
    } catch (e) {
      console.log('Error parsing JSON:', e.message);
    }
  });
});
