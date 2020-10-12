const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const { decode_colors, colors } = require('./colors');


const startCoord = {
	x: process.argv[3] || 304,
	y: process.argv[4] || 145
}

const convert = async () => {
  const realImg = await loadImage(process.argv[2] || 'image.png');

  const canvas = createCanvas(realImg.width, realImg.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(realImg, 0, 0, realImg.width, realImg.height);

  const img = ctx.getImageData(0, 0, realImg.width, realImg.height).data;
  const dataToDraw = [];

  
  for (let y = 0; y < realImg.height; y++) {
    for (let x = 0; x < realImg.width * 4; x += 4 * 10) {
      const offset = x + (y * realImg.width * 4 * 10);
      const color = [img[offset], img[offset + 1], img[offset + 2]];

      if (img[offset + 3] < 1) continue;  // Если альфа-прозрачность = 0
      else {
        for (const colord of colors) {
          if (color[0] === colord[0] && color[1] === colord[1] && color[2] === colord[2]) {
            if (!(y in dataToDraw)) dataToDraw[y] = [];
            dataToDraw[y][x / 40] = colord[3];
            break;
          }
        }
      }
    }
  }
  const data = {
    start: startCoord,
    img: dataToDraw
  };
  fs.writeFileSync('../image.json', JSON.stringify(data));
}
convert();

