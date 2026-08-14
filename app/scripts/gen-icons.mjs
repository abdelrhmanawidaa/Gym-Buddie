import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function makePng(size, pixelFn) {
  const width = size, height = size;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  let offset = 0;
  for (let y = 0; y < height; y++) {
    raw[offset++] = 0; // filter type none
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height);
      raw[offset++] = r;
      raw[offset++] = g;
      raw[offset++] = b;
      raw[offset++] = a;
    }
  }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const idat = deflateSync(raw);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// Colors
const bg1 = [16, 185, 129]; // emerald-500
const bg2 = [5, 150, 105]; // emerald-600
const white = [255, 255, 255];

function pixel(x, y, w, h) {
  const cx = w / 2, cy = h / 2;
  const t = (x + y) / (w + h);
  const bg = [
    Math.round(bg1[0] + (bg2[0] - bg1[0]) * t),
    Math.round(bg1[1] + (bg2[1] - bg1[1]) * t),
    Math.round(bg1[2] + (bg2[2] - bg1[2]) * t),
  ];

  // draw a simple dumbbell shape in white
  const barHalf = w * 0.28;
  const barThick = h * 0.06;
  const plateW = w * 0.09;
  const plateH = h * 0.34;
  const dx = x - cx;
  const dy = y - cy;

  // bar
  if (Math.abs(dx) < barHalf && Math.abs(dy) < barThick) return [...white, 255];
  // left plate
  if (dx < -barHalf + plateW * 0.2 && dx > -barHalf - plateW && Math.abs(dy) < plateH) return [...white, 255];
  // right plate
  if (dx > barHalf - plateW * 0.2 && dx < barHalf + plateW && Math.abs(dy) < plateH) return [...white, 255];

  return [...bg, 255];
}

mkdirSync('public', { recursive: true });
writeFileSync('public/pwa-192.png', makePng(192, pixel));
writeFileSync('public/pwa-512.png', makePng(512, pixel));
writeFileSync('public/apple-touch-icon.png', makePng(180, pixel));
console.log('icons generated');
