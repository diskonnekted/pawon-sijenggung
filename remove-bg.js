const { Jimp } = require('jimp');

async function removeWhiteBackground() {
  const imagePath = 'i:/pawonsjg/public/logo.png';
  const image = await Jimp.read(imagePath);
  
  // Iterate over every pixel
  image.scan((x, y, idx) => {
    // Get RGB values
    const r = image.bitmap.data[idx + 0];
    const g = image.bitmap.data[idx + 1];
    const b = image.bitmap.data[idx + 2];
    
    // Check if pixel is close to white (tolerance to handle anti-aliasing)
    // Actually, let's use a threshold. Since it's a solid white background, > 240 is usually good.
    if (r > 245 && g > 245 && b > 245) {
      // Make it transparent
      image.bitmap.data[idx + 3] = 0; 
    }
  });

  await image.write(imagePath);
  console.log('Background removed and saved.');
}

removeWhiteBackground().catch(err => console.log('Error:', err.message));
