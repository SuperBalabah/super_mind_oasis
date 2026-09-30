// Simple script to generate valid PNG icon for PWA using Node.js zlib
import fs from 'fs';
import zlib from 'zlib';

function createZenIconPNG(width, height, outputPath) {
  // We will generate an uncompressed or zlib-compressed PNG
  // Color palette: Deep twilight teal background (#142129), radiant golden-green glowing zen tree (#7ecb94, #e6c875)
  const buffer = Buffer.alloc(width * height * 4);
  const cx = width / 2;
  const cy = height / 2;
  const rMax = width / 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background gradient (Rounded squircle / circular badge)
      const bgR = 18, bgG = 28, bgB = 35; // #121c23
      const ringDist = dist / rMax;
      
      let red = bgR, green = bgG, blue = bgB, alpha = 255;

      // Outer glow circle
      if (dist < rMax * 0.85) {
        const glow = 1 - (dist / (rMax * 0.85));
        red += Math.floor(glow * 25);
        green += Math.floor(glow * 45);
        blue += Math.floor(glow * 50);
      }

      // Golden Moon / Sun behind tree
      const sunDx = x - cx;
      const sunDy = y - (cy - height * 0.1);
      const sunDist = Math.sqrt(sunDx * sunDx + sunDy * sunDy);
      if (sunDist < width * 0.22) {
        const sunFactor = 1 - (sunDist / (width * 0.22));
        red = Math.min(255, red + Math.floor(sunFactor * 220));
        green = Math.min(255, green + Math.floor(sunFactor * 190));
        blue = Math.min(255, blue + Math.floor(sunFactor * 110));
      }

      // Zen Tree Trunk (vertical with slight flare at base)
      const trunkW = width * 0.04;
      const trunkTop = cy - height * 0.05;
      const trunkBottom = cy + height * 0.25;
      if (y >= trunkTop && y <= trunkBottom && Math.abs(dx) < trunkW * (1 + (y - trunkTop) / (trunkBottom - trunkTop) * 0.8)) {
        red = 110; green = 80; blue = 60; // warm bark
      }

      // Zen Tree Foliage (cloud-like soothing green domes)
      const foliageNodes = [
        { x: cx, y: cy - height * 0.15, r: width * 0.18 },
        { x: cx - width * 0.14, y: cy - height * 0.08, r: width * 0.13 },
        { x: cx + width * 0.14, y: cy - height * 0.08, r: width * 0.13 },
        { x: cx - width * 0.07, y: cy - height * 0.22, r: width * 0.11 },
        { x: cx + width * 0.07, y: cy - height * 0.22, r: width * 0.11 }
      ];

      for (const node of foliageNodes) {
        const fdx = x - node.x;
        const fdy = y - node.y;
        const fdist = Math.sqrt(fdx * fdx + fdy * fdy);
        if (fdist < node.r) {
          const f = 1 - (fdist / node.r);
          red = Math.floor(80 + f * 50);
          green = Math.floor(180 + f * 60);
          blue = Math.floor(140 + f * 40);
        }
      }

      // Island base / Ground curve
      const groundY = trunkBottom;
      const groundW = width * 0.35;
      if (y >= groundY && y <= groundY + height * 0.06) {
        const gdx = Math.abs(dx);
        if (gdx < groundW * (1 - (y - groundY)/(height * 0.06)*0.3)) {
          red = 55; green = 95; blue = 65; // lush moss
        }
      }

      buffer[idx] = Math.min(255, red);
      buffer[idx + 1] = Math.min(255, green);
      buffer[idx + 2] = Math.min(255, blue);
      buffer[idx + 3] = alpha;
    }
  }

  // PNG encoder
  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 4)] = 0; // Filter type: None
    buffer.copy(rawData, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const deflated = zlib.deflateSync(rawData);

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const crc = crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crc, 8 + len);
    return buf;
  }

  // CRC32 implementation
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let k = 0; k < 8; k++) {
        c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  const png = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
  fs.writeFileSync(outputPath, png);
  console.log(`Saved icon: ${outputPath} (${width}x${height})`);
}

// Ensure public dir exists
if (!fs.existsSync('public')) fs.mkdirSync('public', { recursive: true });

createZenIconPNG(192, 192, 'public/icon-192.png');
createZenIconPNG(512, 512, 'public/icon-512.png');
createZenIconPNG(180, 180, 'public/apple-touch-icon.png');
