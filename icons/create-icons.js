/**
 * Icon Generator Script for Image Downloader Extension
 *
 * Run this script with Node.js to generate the PNG icons:
 *   node create-icons.js
 *
 * This creates simple blue square icons with a download arrow.
 * Requires no external dependencies - uses pure Node.js.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Simple PNG encoder using Node's built-in zlib
function createPNG(width, height, rgbaData) {
  const crc32Table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crc32Table[i] = c >>> 0;
  }

  function crc32(data) {
    let crc = 0xffffffff;
    for (let i = 0; i < data.length; i++) {
      crc = crc32Table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function writeChunk(type, data) {
    const chunk = Buffer.alloc(4 + type.length + data.length + 4);
    chunk.writeUInt32BE(data.length, 0);
    chunk.write(type, 4);
    data.copy(chunk, 8);
    const crcData = Buffer.concat([Buffer.from(type), data]);
    chunk.writeUInt32BE(crc32(crcData), 8 + data.length);
    return chunk;
  }

  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type (RGBA)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Prepare raw image data with filter bytes
  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 4)] = 0; // filter type: none
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = y * (1 + width * 4) + 1 + x * 4;
      rawData[dstIdx] = rgbaData[srcIdx];
      rawData[dstIdx + 1] = rgbaData[srcIdx + 1];
      rawData[dstIdx + 2] = rgbaData[srcIdx + 2];
      rawData[dstIdx + 3] = rgbaData[srcIdx + 3];
    }
  }

  // Use Node's zlib for proper compression
  const zlibData = zlib.deflateSync(rawData, { level: 9 });

  // IEND chunk
  const iend = Buffer.alloc(0);

  return Buffer.concat([
    signature,
    writeChunk('IHDR', ihdr),
    writeChunk('IDAT', zlibData),
    writeChunk('IEND', iend)
  ]);
}

function generateIcon(size) {
  const data = Buffer.alloc(size * size * 4);

  // Fill with blue background (#1a73e8)
  for (let i = 0; i < size * size; i++) {
    data[i * 4] = 0x1a;     // R
    data[i * 4 + 1] = 0x73; // G
    data[i * 4 + 2] = 0xe8; // B
    data[i * 4 + 3] = 255;  // A
  }

  function setPixel(x, y, r, g, b, a = 255) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x >= 0 && x < size && y >= 0 && y < size) {
      const idx = (y * size + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = a;
    }
  }

  function fillRect(x1, y1, x2, y2, r, g, b) {
    for (let y = Math.floor(y1); y <= Math.floor(y2); y++) {
      for (let x = Math.floor(x1); x <= Math.floor(x2); x++) {
        setPixel(x, y, r, g, b);
      }
    }
  }

  function fillCircle(cx, cy, radius, r, g, b) {
    for (let y = cy - radius; y <= cy + radius; y++) {
      for (let x = cx - radius; x <= cx + radius; x++) {
        if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= radius * radius) {
          setPixel(x, y, r, g, b);
        }
      }
    }
  }

  const scale = size / 16;
  const cx = size / 2;
  const cy = size / 2;

  // Draw download arrow (white)
  // Vertical bar of the arrow
  const barWidth = Math.max(2, Math.round(3 * scale));
  const barHeight = Math.max(4, Math.round(5 * scale));
  const barX1 = cx - barWidth / 2;
  const barY1 = Math.round(2.5 * scale);
  fillRect(barX1, barY1, barX1 + barWidth - 1, barY1 + barHeight - 1, 255, 255, 255);

  // Arrow head (triangle pointing down)
  const arrowY = barY1 + barHeight;
  const arrowWidth = Math.max(6, Math.round(8 * scale));
  const arrowHeight = Math.max(3, Math.round(4 * scale));

  for (let row = 0; row < arrowHeight; row++) {
    const ratio = 1 - (row / arrowHeight);
    const rowWidth = Math.round(arrowWidth * ratio);
    if (rowWidth > 0) {
      const startX = cx - rowWidth / 2;
      fillRect(startX, arrowY + row, startX + rowWidth - 1, arrowY + row, 255, 255, 255);
    }
  }

  // Bottom line (like a download tray)
  const lineY = Math.round(size - 3 * scale);
  const lineWidth = Math.max(8, Math.round(10 * scale));
  const lineX1 = cx - lineWidth / 2;
  const lineThickness = Math.max(1, Math.round(1.5 * scale));
  fillRect(lineX1, lineY, lineX1 + lineWidth - 1, lineY + lineThickness - 1, 255, 255, 255);

  return createPNG(size, size, data);
}

// Generate all icon sizes
const sizes = [16, 32, 48, 128];
const iconsDir = __dirname;

console.log('Generating icons for Image Downloader extension...\n');

sizes.forEach(size => {
  const filename = `icon${size}.png`;
  const filepath = path.join(iconsDir, filename);
  const pngData = generateIcon(size);
  fs.writeFileSync(filepath, pngData);
  console.log(`  Created: ${filename} (${size}x${size}px, ${pngData.length} bytes)`);
});

console.log('\nDone! All icons generated successfully.');
console.log('\nNext steps:');
console.log('  1. Go to chrome://extensions/');
console.log('  2. Find "Image Downloader"');
console.log('  3. Click the refresh button to reload the extension');
