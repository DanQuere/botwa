import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import webp from 'node-webpmux';
import config from '../config/config.js';
import logger from '../utils/logger.js';

/**
 * Injects WhatsApp EXIF metadata into a WebP buffer
 * @param {Buffer} webpBuffer - WebP image buffer
 * @param {string} packname - Sticker pack name
 * @param {string} author - Sticker author name
 * @param {string[]} categories - Emoji categories (e.g. ['🤖', '✨'])
 * @returns {Promise<Buffer>}
 */
export async function addExif(
  webpBuffer,
  packname = config.sticker?.packname || 'Antigravity Bot',
  author = config.sticker?.author || 'WhatsApp Bot 2026',
  categories = ['🤖', '✨']
) {
  try {
    const img = new webp.Image();
    await img.load(webpBuffer);

    const json = {
      'sticker-pack-id': crypto.randomBytes(16).toString('hex'),
      'sticker-pack-name': String(packname || ''),
      'sticker-pack-publisher': String(author || ''),
      'emojis': Array.isArray(categories) && categories.length ? categories : ['🤖']
    };

    const exifAttr = Buffer.from([
      0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00,
      0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00,
      0x00, 0x00
    ]);
    const jsonBuff = Buffer.from(JSON.stringify(json), 'utf-8');
    const exif = Buffer.concat([exifAttr, jsonBuff]);
    exif.writeUIntLE(jsonBuff.length, 14, 4);

    img.exif = exif;
    return await img.save(null);
  } catch (err) {
    logger.warn(`[Sticker] Gagal menyematkan EXIF: ${err.message}`);
    return webpBuffer;
  }
}

/**
 * Extracts EXIF metadata from a WebP sticker
 * @param {Buffer} webpBuffer
 * @returns {Promise<{packname: string, author: string, emojis: string[]}|null>}
 */
export async function extractExif(webpBuffer) {
  try {
    const img = new webp.Image();
    await img.load(webpBuffer);
    if (!img.exif) return null;

    const raw = img.exif.toString('utf-8');
    const jsonStart = raw.indexOf('{"sticker-pack-id"');
    if (jsonStart === -1) return null;

    const jsonStr = raw.slice(jsonStart);
    const parsed = JSON.parse(jsonStr);
    return {
      packname: parsed['sticker-pack-name'] || '',
      author: parsed['sticker-pack-publisher'] || '',
      emojis: parsed['emojis'] || []
    };
  } catch (e) {
    return null;
  }
}

/**
 * Converts static image (JPEG, PNG, WebP, SVG, GIF) to 512x512 WebP sticker
 * @param {Buffer} buffer - Image buffer
 * @param {object} options - Options
 * @returns {Promise<Buffer>}
 */
export async function createImageSticker(buffer, options = {}) {
  const {
    packname = config.sticker?.packname || 'Antigravity Bot',
    author = config.sticker?.author || 'WhatsApp Bot 2026',
    type = 'crop', // 'crop' (cover) | 'full' (contain with transparent pad) | 'circle'
    quality = 80
  } = options;

  let pipeline = sharp(buffer, { failOnError: false }).rotate(); // Auto-orient based on EXIF

  if (type === 'circle') {
    const circleShape = Buffer.from('<svg width="512" height="512"><circle cx="256" cy="256" r="256" fill="#fff" /></svg>');
    pipeline = pipeline
      .resize(512, 512, { fit: 'cover' })
      .composite([{ input: circleShape, blend: 'dest-in' }]);
  } else if (type === 'crop') {
    pipeline = pipeline.resize(512, 512, { fit: 'cover', position: 'center' });
  } else {
    // 'full' / 'contain' with transparent background
    pipeline = pipeline.resize(512, 512, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    });
  }

  const webpBuffer = await pipeline
    .webp({ quality, effort: 4, lossless: false })
    .toBuffer();

  return await addExif(webpBuffer, packname, author);
}

/**
 * Creates circular sticker
 * @param {Buffer} buffer
 * @param {object} options
 * @returns {Promise<Buffer>}
 */
export async function createCircleSticker(buffer, options = {}) {
  return await createImageSticker(buffer, { ...options, type: 'circle' });
}

/**
 * Converts video, animated GIF, or animated WebP to 512x512 animated WebP sticker
 * @param {Buffer} buffer - Video/GIF buffer
 * @param {object} options - Options
 * @returns {Promise<Buffer>}
 */
export async function createVideoSticker(buffer, options = {}) {
  const {
    packname = config.sticker?.packname || 'Antigravity Bot',
    author = config.sticker?.author || 'WhatsApp Bot 2026',
    type = 'crop', // 'crop' | 'full'
    fps = 15,
    duration = 6, // max 6 seconds to stay under 1MB WhatsApp limit
    quality = 60
  } = options;

  const tempId = crypto.randomBytes(8).toString('hex');
  const tempInput = path.join(os.tmpdir(), `vid_in_${tempId}`);
  const tempGif = path.join(os.tmpdir(), `vid_gif_${tempId}.gif`);

  await fs.promises.writeFile(tempInput, buffer);

  try {
    const vfCrop = `fps=${fps},scale=512:512:force_original_aspect_ratio=increase,crop=512:512`;
    const vfFull = `fps=${fps},scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000:eval=init`;
    const selectedVf = type === 'crop' ? vfCrop : vfFull;

    // Convert video/GIF to standardized 512x512 GIF via ffmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(tempInput)
        .addOutputOptions([
          '-vf', selectedVf,
          '-ss', '00:00:00',
          '-t', `00:00:0${Math.min(Math.max(duration, 1), 7)}`,
          '-an'
        ])
        .toFormat('gif')
        .save(tempGif)
        .on('end', () => resolve(true))
        .on('error', (err) => reject(err));
    });

    const gifBuffer = await fs.promises.readFile(tempGif);

    // Convert GIF to animated WebP using sharp's high performance libvips engine
    const animatedWebp = await sharp(gifBuffer, { animated: true })
      .webp({
        effort: 4,
        quality,
        loop: 0,
        lossless: false
      })
      .toBuffer();

    return await addExif(animatedWebp, packname, author);
  } finally {
    try {
      if (fs.existsSync(tempInput)) await fs.promises.unlink(tempInput);
      if (fs.existsSync(tempGif)) await fs.promises.unlink(tempGif);
    } catch {}
  }
}

/**
 * Creates a Meme sticker with Top and/or Bottom text
 * @param {Buffer} buffer - Image buffer
 * @param {string} topText - Text for top
 * @param {string} bottomText - Text for bottom
 * @param {object} options - Options
 * @returns {Promise<Buffer>}
 */
export async function createMemeSticker(buffer, topText = '', bottomText = '', options = {}) {
  const {
    packname = config.sticker?.packname || 'Antigravity Bot',
    author = config.sticker?.author || 'WhatsApp Bot 2026'
  } = options;

  const escapeXml = (unsafe) => {
    return String(unsafe || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const topXml = escapeXml(topText.toUpperCase().trim());
  const bottomXml = escapeXml(bottomText.toUpperCase().trim());

  let textSvgElements = '';
  if (topXml) {
    textSvgElements += `<text x="256" y="55" class="meme-text">${topXml}</text>`;
  }
  if (bottomXml) {
    textSvgElements += `<text x="256" y="480" class="meme-text">${bottomXml}</text>`;
  }

  const memeSvg = Buffer.from(`
    <svg width="512" height="512">
      <style>
        .meme-text {
          fill: white;
          font-family: Impact, "Arial Black", sans-serif;
          font-size: 38px;
          font-weight: bold;
          text-anchor: middle;
          stroke: black;
          stroke-width: 4px;
          paint-order: stroke fill;
        }
      </style>
      ${textSvgElements}
    </svg>
  `);

  const webpBuffer = await sharp(buffer, { failOnError: false })
    .rotate()
    .resize(512, 512, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .composite([{ input: memeSvg, top: 0, left: 0 }])
    .webp({ quality: 80, effort: 4 })
    .toBuffer();

  return await addExif(webpBuffer, packname, author);
}

/**
 * Universal sticker maker: automatically detects whether media is animated or static
 * @param {Buffer} mediaBuffer - Image, video, or GIF buffer
 * @param {object} options - Options
 * @returns {Promise<Buffer>}
 */
export async function createSticker(mediaBuffer, options = {}) {
  const { isAnimated = false, type = 'crop' } = options;

  // Auto-detect format from buffer magic numbers if not explicitly set
  let shouldAnimate = isAnimated;
  if (!shouldAnimate && mediaBuffer && mediaBuffer.length > 12) {
    const header = mediaBuffer.slice(0, 12).toString('hex');
    // GIF87a (474946383761) or GIF89a (474946383961)
    const isGif = header.startsWith('47494638');
    // MP4 / MOV / ftyp
    const isMp4 = header.includes('66747970') || header.startsWith('000000');
    // WebM
    const isWebm = header.startsWith('1a45dfa3');

    if (isGif || isMp4 || isWebm) {
      shouldAnimate = true;
    }
  }

  if (shouldAnimate) {
    return await createVideoSticker(mediaBuffer, options);
  } else {
    return await createImageSticker(mediaBuffer, options);
  }
}

/**
 * Converts WebP sticker to high quality PNG image buffer
 * @param {Buffer} webpBuffer
 * @returns {Promise<Buffer>}
 */
export async function webpToPng(webpBuffer) {
  try {
    return await sharp(webpBuffer, { failOnError: false }).png().toBuffer();
  } catch (err) {
    // Fallback via ffmpeg
    const tempId = crypto.randomBytes(8).toString('hex');
    const tempInput = path.join(os.tmpdir(), `webp_${tempId}.webp`);
    const tempOutput = path.join(os.tmpdir(), `png_${tempId}.png`);

    await fs.promises.writeFile(tempInput, webpBuffer);
    try {
      await new Promise((resolve, reject) => {
        ffmpeg(tempInput)
          .on('error', reject)
          .on('end', resolve)
          .toFormat('png')
          .save(tempOutput);
      });
      return await fs.promises.readFile(tempOutput);
    } finally {
      try {
        if (fs.existsSync(tempInput)) await fs.promises.unlink(tempInput);
        if (fs.existsSync(tempOutput)) await fs.promises.unlink(tempOutput);
      } catch {}
    }
  }
}

/**
 * Converts animated WebP sticker to MP4 video buffer
 * @param {Buffer} webpBuffer
 * @returns {Promise<Buffer>}
 */
export async function webpToMp4(webpBuffer) {
  const tempId = crypto.randomBytes(8).toString('hex');
  const tempGif = path.join(os.tmpdir(), `anim_gif_${tempId}.gif`);
  const tempMp4 = path.join(os.tmpdir(), `anim_vid_${tempId}.mp4`);

  try {
    // First convert animated WebP to GIF via sharp
    const gifBuffer = await sharp(webpBuffer, { animated: true }).gif().toBuffer();
    await fs.promises.writeFile(tempGif, gifBuffer);

    // Convert GIF to MP4 H.264 (yuv420p) via ffmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(tempGif)
        .addOutputOptions([
          '-c:v', 'libx264',
          '-pix_fmt', 'yuv420p',
          '-movflags', '+faststart',
          '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2'
        ])
        .toFormat('mp4')
        .save(tempMp4)
        .on('end', resolve)
        .on('error', reject);
    });

    return await fs.promises.readFile(tempMp4);
  } finally {
    try {
      if (fs.existsSync(tempGif)) await fs.promises.unlink(tempGif);
      if (fs.existsSync(tempMp4)) await fs.promises.unlink(tempMp4);
    } catch {}
  }
}

/**
 * Converts animated WebP sticker to animated GIF buffer
 * @param {Buffer} webpBuffer
 * @returns {Promise<Buffer>}
 */
export async function webpToGif(webpBuffer) {
  return await sharp(webpBuffer, { animated: true }).gif().toBuffer();
}

export default {
  createSticker,
  createImageSticker,
  createCircleSticker,
  createVideoSticker,
  createMemeSticker,
  addExif,
  extractExif,
  webpToPng,
  webpToMp4,
  webpToGif
};
