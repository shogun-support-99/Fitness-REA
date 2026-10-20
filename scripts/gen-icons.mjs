/**
 * Generates the PWA/brand PNG icons from the app's logo mark — no image
 * dependencies, just math + Node's zlib. Run: node scripts/gen-icons.mjs
 *
 * The mark (64-unit space): dark rounded square, white dumbbell drawn with
 * round-capped strokes — identical to src/components/icons.tsx <Logo/>.
 */
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'

// ---------- tiny PNG encoder ----------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0 // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4)
  }
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// ---------- geometry ----------
const distSeg = (px, py, x1, y1, x2, y2) => {
  const dx = x2 - x1,
    dy = y2 - y1
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
}
const STROKES = [
  [10, 32, 14, 32],
  [50, 32, 54, 32],
  [16, 23, 16, 41],
  [48, 23, 48, 41],
  [20, 32, 44, 32],
]
const HALF_W = 2.75 // stroke-width 5.5 / 2

function inRoundedRect(x, y, x0, y0, x1, y1, r) {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false
  const cx = Math.max(x0 + r, Math.min(x, x1 - r))
  const cy = Math.max(y0 + r, Math.min(y, y1 - r))
  return Math.hypot(x - cx, y - cy) <= r || (x >= x0 + r && x <= x1 - r) || (y >= y0 + r && y <= y1 - r)
}

/** renders the mark at `size` px; artScale shrinks the dumbbell for maskable
 * safe zone; fullBleed paints an opaque square (OS-applied masks need that). */
function render(size, artScale = 1, fullBleed = false) {
  const S = size / 64
  const rgba = Buffer.alloc(size * size * 4)
  const SS = 3 // supersampling
  const cx = 32,
    cy = 32
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let bgCov = 0,
        artCov = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const x = (px + (sx + 0.5) / SS) / S
          const y = (py + (sy + 0.5) / SS) / S
          if (fullBleed || inRoundedRect(x, y, 0, 0, 64, 64, 14)) bgCov++
          if (artScale === 1) {
            if (STROKES.some(([a, b, c, d]) => distSeg(x, y, a, b, c, d) <= HALF_W)) artCov++
          } else {
            const lx = cx + (x - cx) / artScale
            const ly = cy + (y - cy) / artScale
            if (STROKES.some(([a, b, c, d]) => distSeg(lx, ly, a, b, c, d) <= HALF_W)) artCov++
          }
        }
      }
      const total = SS * SS
      const artA = artCov / total
      const bgA = bgCov / total
      // composite white art over the dark plate over transparency
      const [r, g, b, a] = artA > 0
        ? [
            Math.round(255 * artA + 14 * (1 - artA)),
            Math.round(255 * artA + 15 * (1 - artA)),
            Math.round(255 * artA + 19 * (1 - artA)),
            Math.max(artA, bgA),
          ]
        : [14, 15, 19, bgA]
      const i = (py * size + px) * 4
      rgba[i] = r
      rgba[i + 1] = g
      rgba[i + 2] = b
      rgba[i + 3] = Math.round(a * 255)
    }
  }
  return encodePNG(size, size, rgba)
}

mkdirSync('public', { recursive: true })
writeFileSync('public/icon-192.png', render(192))
writeFileSync('public/icon-512.png', render(512))
writeFileSync('public/icon-maskable-512.png', render(512, 0.62, true))
writeFileSync('public/apple-touch-icon.png', render(180, 1, true))
console.log('icons written: public/icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png')
